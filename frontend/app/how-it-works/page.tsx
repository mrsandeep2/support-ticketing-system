import Link from "next/link";

const steps = [
  {
    title: "User creates a ticket",
    desc: "Capture the issue with priority and attachments.",
  },
  {
    title: "Support agent gets assigned",
    desc: "Route tickets to the right team member quickly.",
  },
  {
    title: "Ticket status updates",
    desc: "Move through the workflow with transparent updates.",
  },
  {
    title: "Issue gets resolved",
    desc: "Close the loop with clear resolution notes.",
  },
  {
    title: "User rates resolution",
    desc: "Collect feedback to improve support quality.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
        <div>
          <p className="text-sm text-orange-600 font-semibold">How it works</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-2">A simple, reliable workflow</h1>
          <p className="mt-3 text-slate-600">
            Keep every request visible, tracked, and resolved with a consistent process from start to finish.
          </p>
          <Link href="/login" className="btn-primary mt-6 inline-flex">Get Started</Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {steps.map((s, idx) => (
            <div key={s.title} className="card p-5">
              <div className="text-xs font-semibold text-orange-600">Step {idx + 1}</div>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
