"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import { Priority, Status, TicketListItem, UserSummary } from "@/lib/types";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { getUser } from "@/lib/auth";

export default function TicketsPage() {
  return <AuthGuard><Inner/></AuthGuard>;
}

function Inner() {
  const me = getUser()!;
  const [items, setItems] = useState<TicketListItem[]>([]);
  const [agents, setAgents] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status | "">("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [sort, setSort] = useState<"created"|"priority"|"updated">("created");
  const [onlyMine, setOnlyMine] = useState(me.role === "AGENT");

  const url = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    if (priority) p.set("priority", priority);
    if (assigneeId) p.set("assigneeId", assigneeId);
    if (sort) p.set("sort", sort);
    return `/api/tickets?${p.toString()}`;
  }, [q, status, priority, assigneeId, sort]);

  useEffect(() => { api.get<UserSummary[]>("/api/users/agents").then(setAgents).catch(()=>{}); }, []);
  useEffect(() => {
    if (me.role === "AGENT") {
      setAssigneeId(onlyMine ? String(me.id) : "");
    }
  }, [onlyMine, me.role, me.id]);

  async function load() {
    setLoading(true);
    api.get<TicketListItem[]>(url).then(setItems).finally(() => setLoading(false));
  }
  useEffect(() => {
    load();
  }, [url]);

  async function updateTicket(id: number, body: any) {
    await api.patch(`/api/tickets/${id}`, body);
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <Link href="/tickets/new" className="btn-primary">+ New Ticket</Link>
      </div>
      <div className="card p-4 mb-4 grid md:grid-cols-6 gap-3">
        <input className="input md:col-span-2" placeholder="Search subject…" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="input" value={status} onChange={e=>setStatus(e.target.value as any)}>
          <option value="">All statuses</option>
          {["OPEN","IN_PROGRESS","RESOLVED","CLOSED"].map(s=> <option key={s} value={s}>{s.replace("_"," ")}</option>)}
        </select>
        <select className="input" value={priority} onChange={e=>setPriority(e.target.value as any)}>
          <option value="">All priorities</option>
          {["LOW","MEDIUM","HIGH","URGENT"].map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input" value={sort} onChange={e=>setSort(e.target.value as any)}>
          <option value="created">Newest first</option>
          <option value="updated">Recently updated</option>
          <option value="priority">By priority</option>
        </select>
        {me.role === "ADMIN" && (
          <select className="input" value={assigneeId} onChange={e=>setAssigneeId(e.target.value)}>
            <option value="">All assignees</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.email})</option>)}
          </select>
        )}
        {me.role === "AGENT" && (
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={onlyMine}
              onChange={e => setOnlyMine(e.target.checked)}
            />
            Assigned to me
          </label>
        )}
      </div>
      <div className="card overflow-x-auto">
        {loading && <div className="p-4 text-sm text-slate-500">Loading…</div>}
        {!loading && items.length === 0 && <div className="p-4 text-sm text-slate-500">No tickets match.</div>}
        {!loading && items.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-orange-50/50 text-slate-600 text-left">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Assignee</th>
                <th className="p-3">Updated</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map(t => {
                const isAssignee = t.assignee?.id === me.id;
                const canModify = me.role === "ADMIN" || (me.role === "AGENT" && isAssignee);
                const canReassign = me.role === "ADMIN" || (me.role === "AGENT" && isAssignee);
                return (
                  <tr key={t.id} className="hover:bg-white/70">
                    <td className="p-3 text-slate-500">#{t.id}</td>
                    <td className="p-3 font-medium">{t.subject}</td>
                    <td className="p-3"><PriorityBadge p={t.priority} /></td>
                    <td className="p-3">
                      {canModify ? (
                        <select className="input" value={t.status} onChange={e => updateTicket(t.id, { status: e.target.value })}>
                          {["OPEN","IN_PROGRESS","RESOLVED","CLOSED"].map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
                        </select>
                      ) : (
                        <StatusBadge s={t.status} />
                      )}
                    </td>
                    <td className="p-3">{t.owner.name}</td>
                    <td className="p-3">
                      {canReassign ? (
                        <select
                          className="input"
                          value={t.assignee?.id ?? ""}
                          onChange={e => updateTicket(t.id, { assigneeId: e.target.value ? Number(e.target.value) : null })}
                        >
                          <option value="">Unassigned</option>
                          {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      ) : (
                        <span>{t.assignee ? t.assignee.name : "Unassigned"}</span>
                      )}
                    </td>
                    <td className="p-3">{new Date(t.updatedAt).toLocaleString()}</td>
                    <td className="p-3">
                      <Link href={`/tickets/${t.id}`} className="btn-secondary">Open</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
