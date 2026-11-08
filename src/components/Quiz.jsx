import { useRef, useState } from "react";

export default function Quiz({ questions, onFinish }) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const answers = useRef([]);

  const q = questions[i];
  const answered = picked !== null;
  const last = i === questions.length - 1;

  function pick(n) {
    if (answered) return;
    setPicked(n);
    const correct = n === q.answer;
    answers.current.push({ question_id: q.id, chosen: n, correct });
    if (correct) setScore((s) => s + 1);
  }

  function next() {
    if (last) return onFinish(score, answers.current);
    setI(i + 1);
    setPicked(null);
  }

  const style = (n) => {
    if (!answered) return "border-slate-300 hover:border-blue-600 dark:border-slate-600";
    if (n === q.answer) return "border-green-600 bg-green-100 dark:bg-green-900/40";
    if (n === picked) return "border-red-600 bg-red-100 dark:bg-red-900/40";
    return "border-slate-300 opacity-60 dark:border-slate-600";
  };

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <p className="mb-2 text-sm text-blue-600 dark:text-blue-400">
        Question {i + 1} of {questions.length}: {q.topic}, {q.difficulty}
      </p>
      <p className="mb-4 text-lg font-semibold">{q.question}</p>
      <div className="space-y-2">
        {q.options.map((text, n) => (
          <button key={n} onClick={() => pick(n)} disabled={answered}
            className={`w-full rounded-lg border px-3 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${style(n)}`}>
            {text}
          </button>
        ))}
      </div>
      {answered && q.explanation && (
        <p className="mt-4 border-l-4 border-blue-600 bg-slate-100 px-3 py-2 dark:bg-slate-900">{q.explanation}</p>
      )}
      {answered && (
        <button onClick={next} className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700">
          {last ? "See results" : "Next question"}
        </button>
      )}
    </div>
  );
}
