"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import { Role, UserSummary } from "@/lib/types";

export default function AdminUsers() {
  return <AuthGuard allow={["ADMIN"]}><Inner/></AuthGuard>;
}

function Inner() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); const [role, setRole] = useState<Role>("USER");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() { setUsers(await api.get<UserSummary[]>("/api/admin/users")); }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      await api.post("/api/admin/users", { name, email, password, role });
      setName(""); setEmail(""); setPassword(""); setRole("USER");
      await load();
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }
  async function changeRole(id: number, r: Role) {
    await api.patch(`/api/admin/users/${id}/role`, { role: r });
    load();
  }
  async function remove(id: number) {
    if (!confirm("Remove this user?")) return;
    try { await api.del(`/api/admin/users/${id}`); await load(); }
    catch (e: any) { setErr(e.message); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin · Users</h1>

      <form onSubmit={create} className="card p-4 grid md:grid-cols-5 gap-3">
        <input className="input" placeholder="Name" required value={name} onChange={e=>setName(e.target.value)} />
        <input className="input" placeholder="Email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} />
        <select className="input" value={role} onChange={e=>setRole(e.target.value as Role)}>
          {["USER","AGENT","ADMIN"].map(r=> <option key={r} value={r}>{r}</option>)}
        </select>
        <button className="btn-primary" disabled={busy}>Add user</button>
      </form>
      {err && <div className="text-sm text-red-600">{err}</div>}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr><th className="p-3">#</th><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3"></th></tr>
          </thead>
          <tbody className="divide-y">
            {users.map(u => (
              <tr key={u.id}>
                <td className="p-3 text-slate-500">{u.id}</td>
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <select className="input" value={u.role} onChange={e=>changeRole(u.id, e.target.value as Role)}>
                    {["USER","AGENT","ADMIN"].map(r=> <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="p-3 text-right">
                  <button className="btn-danger" onClick={()=>remove(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
