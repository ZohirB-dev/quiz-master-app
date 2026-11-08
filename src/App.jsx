import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Login from "./components/Login";
import Setup from "./components/Setup";
import Quiz from "./components/Quiz";
import History from "./components/History";

const shuffle = (a) =>
  a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = still checking
  const [phase, setPhase] = useState("setup"); // setup | play | done | history
  const [questions, setQuestions] = useState([]);
  const [meta, setMeta] = useState({});
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  async function start({ topic, difficulty, count, mode }) {
    setError("");
    let list;
    if (mode === "retry") {
      const { data, error } = await supabase
        .from("answers")
        .select("question_id, correct, created_at, questions!inner(*)")
        .eq("questions.topic", topic)
        .order("created_at", { ascending: false });
      if (error) return setError(error.message);
      const seen = new Set();
      list = [];
      for (const r of data) {
        if (seen.has(r.question_id)) continue; // newest answer per question wins
        seen.add(r.question_id);
        if (!r.correct) list.push(r.questions);
      }
      if (difficulty) list = list.filter((q) => q.difficulty === difficulty);
      if (!list.length) return setError("No mistakes to retry here. Nice work.");
    } else {
      let query = supabase.from("questions").select("*").eq("topic", topic);
      if (difficulty) query = query.eq("difficulty", difficulty);
      const { data, error } = await query;
      if (error) return setError(error.message);
      if (!data.length) return setError("No questions match. Try another level.");
      list = data;
    }
    setMeta({ topic, difficulty: difficulty || "all", mode });
    setQuestions(shuffle(list).slice(0, count));
    setSaveMsg("");
    setPhase("play");
  }

  async function finish(finalScore, answers) {
    setScore(finalScore);
    setPhase("done");
    const { data: attempt, error } = await supabase
      .from("attempts")
      .insert({ ...meta, score: finalScore, total: questions.length })
      .select()
      .single();
    if (error) return setSaveMsg("Could not save this quiz: " + error.message);
    const { error: e2 } = await supabase
      .from("answers")
      .insert(answers.map((a) => ({ ...a, attempt_id: attempt.id })));
    setSaveMsg(e2 ? "Could not save answers: " + e2.message : "Saved to your history.");
  }

  if (session === undefined) return null;

  const primary =
    "mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700";

  return (
    <main className="mx-auto max-w-xl px-4 py-10 text-slate-900 dark:text-slate-100">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quiz Master</h1>
        {session && (
          <div className="flex gap-4 text-sm">
            <button onClick={() => setPhase("history")} className="underline">History</button>
            <button onClick={() => supabase.auth.signOut()} className="underline">Sign out</button>
          </div>
        )}
      </div>

      {!session && <Login />}
      {session && phase === "setup" && <Setup onStart={start} error={error} />}
      {session && phase === "play" && <Quiz questions={questions} onFinish={finish} />}
      {session && phase === "history" && <History onBack={() => setPhase("setup")} />}
      {session && phase === "done" && (
        <div className="rounded-xl border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xl font-semibold">You scored {score} out of {questions.length}.</p>
          <p className="mt-2 text-sm text-slate-500">{saveMsg}</p>
          <button onClick={() => setPhase("setup")} className={primary}>New quiz</button>
        </div>
      )}
    </main>
  );
}
