"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setAuth, AuthUser } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      const res = await api.post<{ token: string; user: AuthUser }>("/api/auth/login", { email, password });
      setAuth(res.token, res.user);
      router.push("/dashboard");
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md card p-6">
        <h1 className="font-display text-3xl font-semibold mb-2">Sign in</h1>
        <p className="text-sm text-slate-600 mb-6">Welcome back. Access your tickets and updates.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                className="input pr-20"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e=>setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-orange-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <Link href="/about" className="text-orange-600 hover:underline">Forgot password?</Link>
            <Link href="/signup" className="text-slate-500 hover:underline">Create account</Link>
          </div>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        </form>
      </div>
    </div>
  );
}
