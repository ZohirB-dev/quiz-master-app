import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const field =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-600 dark:bg-slate-900";

export default function Setup({ onStart, error }) {
  const [topics, setTopics] = useState([]);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [count, setCount] = useState(10);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    supabase
      .from("questions")
      .select("topic")
      .then(({ data, error }) => {
        if (error) return setLoadError("Could not load topics: " + error.message);
        const list = [...new Set(data.map((r) => r.topic))].sort();
        setTopics(list);
        setTopic(list[0] ?? "");
      });
  }, []);

  return (
    <div className="space-y-4 rounded-xl border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <label className="block">
        <span className="mb-1 block font-semibold">Topic</span>
        <select className={field} value={topic} onChange={(e) => setTopic(e.target.value)}>
          {topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block font-semibold">Difficulty</span>
        <select className={field} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All levels</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block font-semibold">Questions</span>
        <select className={field} value={count} onChange={(e) => setCount(+e.target.value)}>
          {[5, 10, 20].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>

      <button
        disabled={!topic}
        onClick={() => onStart({ topic, difficulty, count })}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Start quiz
      </button>

      {(error || loadError) && <p className="text-red-600">{error || loadError}</p>}
    </div>
  );
}
