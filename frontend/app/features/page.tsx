import Link from "next/link";

const features = [
  {
    title: "Ticket Creation",
    desc: "Raise support tickets with subject, description, and priority.",
  },
  {
    title: "Ticket Tracking",
    desc: "Track status across Open, In Progress, Resolved, and Closed.",
  },
  {
    title: "Role-Based Access",
    desc: "Separate views for Users, Admins, and Support Agents.",
  },
  {
    title: "Ticket Assignment",
    desc: "Assign and reassign tickets with clear ownership.",
  },
  {
    title: "Comments & History",
    desc: "Threaded discussion and full ticket history in one place.",
  },
  {
    title: "File Attachments",
    desc: "Upload screenshots and documents for faster context.",
  },
  {
    title: "Search & Filters",
    desc: "Filter by status, priority, and assigned agent instantly.",
  },
  {
    title: "Notifications",
    desc: "Email alerts keep everyone updated on changes.",
  },
  {
    title: "Analytics Dashboard",
    desc: "Monitor ticket volume and resolution trends.",
  },
  {
    title: "Resolution Rating",
    desc: "Collect feedback once issues are resolved.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-orange-600 font-semibold">Features</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold">Everything you need to manage tickets</h1>
        </div>
        <Link href="/login" className="btn-primary">Get Started</Link>
      </div>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, idx) => (
          <div key={f.title} className="card p-5">
            <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
              <span className="text-sm font-semibold">{String(idx + 1).padStart(2, "0")}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
