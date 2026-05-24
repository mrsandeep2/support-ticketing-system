"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { setAuth, AuthUser } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("USER");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: AuthUser }>(
        "/api/auth/register",
        { name, email, password }
      );
      setAuth(res.token, res.user);
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md card p-6">
        <h1 className="font-display text-3xl font-semibold mb-2">Create account</h1>
        <p className="text-sm text-slate-600 mb-6">Start tracking and resolving support requests.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" required value={name} onChange={e=>setName(e.target.value)} />
          </div>
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
                minLength={6}
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
          <div>
            <label className="label">Role (optional)</label>
            <select className="input" value={role} onChange={e=>setRole(e.target.value)}>
              <option value="USER">User</option>
              <option value="AGENT">Support Agent</option>
              <option value="ADMIN">Admin</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">Role assignments are confirmed by admins after signup.</p>
          </div>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-4">
          Already have an account? <Link className="text-orange-600 hover:underline" href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
