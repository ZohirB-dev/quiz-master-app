import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const card = "rounded-xl border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-800";
const day = (d) => new Date(d).toLocaleDateString("en-CA");

function streak(attempts) {
  const days = new Set(attempts.map((a) => day(a.created_at)));
  const d = new Date();
  if (!days.has(day(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(day(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export default function History({ onBack }) {
  const [attempts, setAttempts] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("attempts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data, error }) => (error ? setError(error.message) : setAttempts(data)));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!attempts) return <p>Loading…</p>;

  const byTopic = {};
  attempts.forEach((a) => {
    const t = (byTopic[a.topic] ??= { score: 0, total: 0 });
    t.score += a.score;
    t.total += a.total;
  });

  return (
    <div className="space-y-4">
      <div className={card}>
        <p className="text-xl font-semibold">Day streak: {streak(attempts)}</p>
        <p className="text-sm text-slate-500">{attempts.length} quizzes completed</p>
      </div>

      <div className={card}>
        <p className="mb-3 font-semibold">Accuracy by topic</p>
        {Object.entries(byTopic).map(([topic, t]) => {
          const pct = Math.round((t.score / t.total) * 100);
          return (
            <div key={topic} className="mb-3">
              <div className="flex justify-between text-sm">
                <span>{topic}</span>
                <span>{pct}% of {t.total}</span>
              </div>
              <div className="h-2 rounded bg-slate-200 dark:bg-slate-700">
                <div className="h-2 rounded bg-blue-600" style={{ width: pct + "%" }} />
              </div>
            </div>
          );
        })}
        {!attempts.length && <p>No quizzes yet. Finish one and it shows up here.</p>}
      </div>

      <div className={card}>
        <p className="mb-3 font-semibold">Recent quizzes</p>
        <ul className="space-y-1 text-sm">
          {attempts.slice(0, 10).map((a) => (
            <li key={a.id} className="flex justify-between">
              <span>
                {a.topic}, {a.difficulty}{a.mode === "retry" ? " (retry)" : ""}
              </span>
              <span>{a.score}/{a.total} on {day(a.created_at)}</span>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={onBack} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700">
        Back
      </button>
    </div>
  );
}
