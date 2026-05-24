import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div className="card p-6">
          <p className="text-sm text-orange-600 font-semibold">About us</p>
          <h1 className="font-display text-3xl font-semibold mt-2">TicketDesk keeps support human and fast</h1>
          <p className="mt-3 text-slate-600">
            TicketDesk is a modern support and ticket management platform designed for teams to handle
            customer issues, internal IT requests, and service workflows efficiently.
          </p>
          <Link href="/login" className="btn-primary mt-6 inline-flex">Get Started</Link>
        </div>
        <div className="grid gap-4">
          {["Clear mission and accountability", "Reliable workflows built for busy teams", "Secure handling of sensitive requests", "Faster resolutions with smart routing"].map(item => (
            <div key={item} className="card p-4">
              <p className="text-sm text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
