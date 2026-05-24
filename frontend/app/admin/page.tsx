"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import { Priority, Status, TicketListItem, UserSummary } from "@/lib/types";
import { StatusBadge, PriorityBadge } from "@/components/Badges";

export default function AdminTickets() {
  return <AuthGuard allow={["ADMIN"]}><Inner/></AuthGuard>;
}

function Inner() {
  const [items, setItems] = useState<TicketListItem[]>([]);
  const [agents, setAgents] = useState<UserSummary[]>([]);
  const [status, setStatus] = useState<Status | "">("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (priority) p.set("priority", priority);
    if (q) p.set("q", q);
    setItems(await api.get<TicketListItem[]>(`/api/tickets?${p.toString()}`));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status, priority, q]);
  useEffect(() => { api.get<UserSummary[]>("/api/users/agents").then(setAgents); }, []);

  async function force(id: number, body: any) {
    await api.patch(`/api/tickets/${id}`, body);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Admin · All tickets</h1>
      <div className="card p-4 mb-4 grid md:grid-cols-4 gap-3">
        <input className="input md:col-span-2" placeholder="Search subject…" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="input" value={status} onChange={e=>setStatus(e.target.value as any)}>
          <option value="">All statuses</option>
          {["OPEN","IN_PROGRESS","RESOLVED","CLOSED"].map(s=> <option key={s} value={s}>{s.replace("_"," ")}</option>)}
        </select>
        <select className="input" value={priority} onChange={e=>setPriority(e.target.value as any)}>
          <option value="">All priorities</option>
          {["LOW","MEDIUM","HIGH","URGENT"].map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr>
              <th className="p-3">#</th><th className="p-3">Subject</th>
              <th className="p-3">Owner</th><th className="p-3">Assignee</th>
              <th className="p-3">Status</th><th className="p-3">Priority</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && <tr><td className="p-3 text-slate-500" colSpan={7}>Loading…</td></tr>}
            {!loading && items.length === 0 && <tr><td className="p-3 text-slate-500" colSpan={7}>No tickets.</td></tr>}
            {items.map(t => (
              <tr key={t.id}>
                <td className="p-3 text-slate-500">{t.id}</td>
                <td className="p-3"><Link className="text-indigo-600 hover:underline" href={`/tickets/${t.id}`}>{t.subject}</Link></td>
                <td className="p-3">{t.owner.name}</td>
                <td className="p-3">
                  <select className="input" value={t.assignee?.id ?? ""} onChange={e => force(t.id, { assigneeId: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">—</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <select className="input" value={t.status} onChange={e => force(t.id, { status: e.target.value })}>
                    {["OPEN","IN_PROGRESS","RESOLVED","CLOSED"].map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
                  </select>
                </td>
                <td className="p-3"><PriorityBadge p={t.priority} /></td>
                <td className="p-3"><Link className="btn-secondary" href={`/tickets/${t.id}`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
