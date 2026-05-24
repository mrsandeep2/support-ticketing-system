"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import { Priority, Status, Ticket, UserSummary } from "@/lib/types";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { getToken, getUser } from "@/lib/auth";
import RatingStars from "@/components/RatingStars";

const STATUSES: Status[] = ["OPEN","IN_PROGRESS","RESOLVED","CLOSED"];
const PRIORITIES: Priority[] = ["LOW","MEDIUM","HIGH","URGENT"];

export default function TicketDetail() {
  return <AuthGuard><Inner/></AuthGuard>;
}

function Inner() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const me = getUser()!;
  const [t, setT] = useState<Ticket | null>(null);
  const [agents, setAgents] = useState<UserSummary[]>([]);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setT(await api.get<Ticket>(`/api/tickets/${id}`));
  }
  useEffect(() => {
    if (!id) return;
    load().catch(e => setErr(e.message));
    api.get<UserSummary[]>("/api/users/agents").then(setAgents).catch(()=>{});
  }, [id]);

  if (err) return <div className="text-red-600">{err}</div>;
  if (!t) return <div className="text-slate-500">Loading…</div>;

  const isOwner = t.owner.id === me.id;
  const isAssignee = t.assignee?.id === me.id;
  const canModify = me.role === "ADMIN" || (me.role === "AGENT" && isAssignee);
  const canReassign = me.role === "ADMIN" || me.role === "AGENT";
  const canComment = me.role === "ADMIN" || isOwner || (me.role === "AGENT" && isAssignee);
  const canRate = isOwner && (t.status === "RESOLVED" || t.status === "CLOSED");

  async function update(body: any) {
    setBusy(true); setErr(null);
    try { setT(await api.patch<Ticket>(`/api/tickets/${id}`, body)); }
    catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }
  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setBusy(true); setErr(null);
    try {
      setT(await api.post<Ticket>(`/api/tickets/${id}/comments`, { body: comment }));
      setComment("");
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }
  async function uploadFile() {
    if (!file) return;
    const fd = new FormData(); fd.append("file", file);
    setBusy(true); setErr(null);
    try { await api.post(`/api/tickets/${id}/attachments`, fd); await load(); setFile(null); }
    catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }
  async function submitRating() {
    if (!stars) return;
    setBusy(true); setErr(null);
    try { setT(await api.post<Ticket>(`/api/tickets/${id}/rating`, { stars, feedback })); }
    catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }
  async function downloadAtt(attId: number, name: string) {
    const res = await fetch(`${api.baseUrl}/api/tickets/${id}/attachments/${attId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) { setErr("Download failed"); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-start gap-3 mb-2">
          <span className="text-sm text-slate-500">#{t.id}</span>
          <h1 className="text-2xl font-semibold flex-1">{t.subject}</h1>
          <PriorityBadge p={t.priority} />
          <StatusBadge s={t.status} />
        </div>
        <p className="whitespace-pre-wrap text-slate-700 mt-2">{t.description}</p>
        <div className="text-xs text-slate-500 mt-3">
          Owner: {t.owner.name} ({t.owner.email}) ·
          Assignee: {t.assignee ? `${t.assignee.name} (${t.assignee.email})` : "Unassigned"} ·
          Created {new Date(t.createdAt).toLocaleString()} ·
          Updated {new Date(t.updatedAt).toLocaleString()}
          {t.resolvedAt && <> · Resolved {new Date(t.resolvedAt).toLocaleString()}</>}
        </div>

        {(canModify || canReassign) && (
          <div className="mt-4 grid md:grid-cols-3 gap-3">
            {canModify && (
              <select className="input" disabled={busy} value={t.status} onChange={e => update({ status: e.target.value })}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
            )}
            {canModify && (
              <select className="input" disabled={busy} value={t.priority} onChange={e => update({ priority: e.target.value })}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            )}
            {canReassign && (
              <select className="input" disabled={busy} value={t.assignee?.id ?? ""} onChange={e => update({ assigneeId: e.target.value ? Number(e.target.value) : null })}>
                <option value="">— assign agent —</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.email})</option>)}
              </select>
            )}
          </div>
        )}
        {err && <div className="text-sm text-red-600 mt-2">{err}</div>}
      </div>

      <div className="card p-5">
        <h2 className="font-medium mb-3">Attachments</h2>
        <ul className="text-sm space-y-1">
          {t.attachments.map(a => (
            <li key={a.id} className="flex items-center gap-2">
              <button onClick={() => downloadAtt(a.id, a.filename)} className="text-indigo-600 hover:underline">{a.filename}</button>
              <span className="text-slate-500 text-xs">{a.size ? `${Math.round(a.size/1024)} KB` : ""} · by {a.uploader.name}</span>
            </li>
          ))}
          {t.attachments.length === 0 && <li className="text-slate-500">No attachments.</li>}
        </ul>
        {canComment && (
          <div className="mt-3 flex gap-2">
            <input className="input" type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
            <button className="btn-secondary" disabled={!file || busy} onClick={uploadFile}>Upload</button>
          </div>
        )}
      </div>

      <div className="card p-5">
        <h2 className="font-medium mb-3">Comments & history</h2>
        <ul className="space-y-3">
          {t.comments.map(c => (
            <li key={c.id} className="border-l-2 border-indigo-200 pl-3">
              <div className="text-xs text-slate-500">{c.author.name} <span className="text-slate-400">({c.author.role})</span> · {new Date(c.createdAt).toLocaleString()}</div>
              <div className="whitespace-pre-wrap text-sm">{c.body}</div>
            </li>
          ))}
          {t.comments.length === 0 && <li className="text-slate-500 text-sm">No comments yet.</li>}
        </ul>
        {canComment && (
          <form onSubmit={postComment} className="mt-4 space-y-2">
            <textarea className="input min-h-[80px]" placeholder="Write a comment…" value={comment} onChange={e=>setComment(e.target.value)} />
            <button className="btn-primary" disabled={busy}>Post comment</button>
          </form>
        )}
      </div>

      {canRate && (
        <div className="card p-5">
          <h2 className="font-medium mb-3">Rate this resolution</h2>
          {t.rating ? (
            <div>
              <RatingStars value={t.rating.stars} readOnly />
              {t.rating.feedback && <p className="text-sm text-slate-700 mt-2">{t.rating.feedback}</p>}
              <div className="text-xs text-slate-500 mt-1">Submitted {new Date(t.rating.createdAt).toLocaleString()}</div>
            </div>
          ) : (
            <div className="space-y-3">
              <RatingStars value={stars} onChange={setStars} />
              <textarea className="input min-h-[80px]" placeholder="Optional feedback…" value={feedback} onChange={e=>setFeedback(e.target.value)} />
              <button className="btn-primary" disabled={!stars || busy} onClick={submitRating}>Submit rating</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
