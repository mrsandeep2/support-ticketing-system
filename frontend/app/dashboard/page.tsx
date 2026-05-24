"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import { TicketListItem } from "@/lib/types";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { getUser } from "@/lib/auth";

export default function Dashboard() {
  return <AuthGuard><DashboardInner/></AuthGuard>;
}

function DashboardInner() {
  const me = getUser()!;
  const [items, setItems] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<TicketListItem[]>("/api/tickets")
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const counts = items.reduce((acc, t) => { acc[t.status] = (acc[t.status]||0)+1; return acc; }, {} as Record<string, number>);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Welcome, {me.name}</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(["OPEN","IN_PROGRESS","RESOLVED","CLOSED"] as const).map(s => (
          <div key={s} className="card p-4">
            <div className="text-xs text-slate-500">{s.replace("_"," ")}</div>
            <div className="text-2xl font-semibold">{counts[s] || 0}</div>
          </div>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <div className="p-4 font-medium">Recent tickets</div>
        {loading && <div className="p-4 text-sm text-slate-500">Loading…</div>}
        {!loading && items.length === 0 && <div className="p-4 text-sm text-slate-500">No tickets yet. Create your first one!</div>}
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
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.slice(0, 10).map(t => (
                <tr key={t.id} className="hover:bg-white/70">
                  <td className="p-3 text-slate-500">#{t.id}</td>
                  <td className="p-3 font-medium">{t.subject}</td>
                  <td className="p-3"><PriorityBadge p={t.priority} /></td>
                  <td className="p-3"><StatusBadge s={t.status} /></td>
                  <td className="p-3">{t.owner.name}</td>
                  <td className="p-3">{t.assignee ? t.assignee.name : "Unassigned"}</td>
                  <td className="p-3">
                    <Link href={`/tickets/${t.id}`} className="btn-secondary">Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
