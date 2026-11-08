import { useState } from "react";
import { supabase } from "../lib/supabase";

const field =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-600 dark:bg-slate-900";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function signIn(e) {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
  }

  return (
    <form
      onSubmit={signIn}
      className="space-y-4 rounded-xl border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
    >
      <label className="block">
        <span className="mb-1 block font-semibold">Email</span>
        <input type="email" required className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="block">
        <span className="mb-1 block font-semibold">Password</span>
        <input type="password" required className={field} value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700">
        Sign in
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}
