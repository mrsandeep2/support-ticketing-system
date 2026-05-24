"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import { Priority, Ticket } from "@/lib/types";

export default function NewTicketPage() {
  return <AuthGuard><Inner/></AuthGuard>;
}

function Inner() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [files, setFiles] = useState<FileList | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      const t = await api.post<Ticket>("/api/tickets", { subject, description, priority });
      if (files && files.length) {
        for (const f of Array.from(files)) {
          const fd = new FormData(); fd.append("file", f);
          await api.post(`/api/tickets/${t.id}/attachments`, fd);
        }
      }
      router.push(`/tickets/${t.id}`);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-2xl mx-auto card p-6">
      <h1 className="text-2xl font-semibold mb-4">Raise a new ticket</h1>
      <form onSubmit={submit} className="space-y-3">
        <div><label className="label">Subject</label><input className="input" required maxLength={200} value={subject} onChange={e=>setSubject(e.target.value)} /></div>
        <div><label className="label">Description</label><textarea className="input min-h-[140px]" required value={description} onChange={e=>setDescription(e.target.value)} /></div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={priority} onChange={e=>setPriority(e.target.value as Priority)}>
            {["LOW","MEDIUM","HIGH","URGENT"].map(p=> <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Attachments (optional)</label>
          <input className="input" type="file" multiple onChange={e=>setFiles(e.target.files)} />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button className="btn-primary" disabled={loading}>{loading ? "Creating…" : "Create ticket"}</button>
      </form>
    </div>
  );
}
