import { useState } from "react";
import { supabase } from "./lib/supabase";
import Setup from "./components/Setup";
import Quiz from "./components/Quiz";

const shuffle = (a) =>
  a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);

export default function App() {
  const [phase, setPhase] = useState("setup"); // setup | play | done
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");

  async function start({ topic, difficulty, count }) {
    setError("");
    let query = supabase.from("questions").select("*").eq("topic", topic);
    if (difficulty) query = query.eq("difficulty", difficulty);
    const { data, error } = await query;
    if (error) return setError(error.message);
    if (!data.length) return setError("No questions match. Try another level.");
    setQuestions(shuffle(data).slice(0, count));
    setPhase("play");
  }

  function finish(finalScore) {
    setScore(finalScore);
    setPhase("done");
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10 text-slate-900 dark:text-slate-100">
      <h1 className="mb-6 text-2xl font-bold">Quiz Master</h1>

      {phase === "setup" && <Setup onStart={start} error={error} />}
      {phase === "play" && <Quiz questions={questions} onFinish={finish} />}
      {phase === "done" && (
        <div className="rounded-xl border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xl font-semibold">
            You scored {score} out of {questions.length}.
          </p>
          <button
            onClick={() => setPhase("setup")}
            className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            New quiz
          </button>
        </div>
      )}
    </main>
  );
}
