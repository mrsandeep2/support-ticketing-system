"use client";

import Link from "next/link";
import { getUser } from "@/lib/auth";

export default function Home() {
  const user = getUser();
  const getStartedHref = user ? "/dashboard" : "/login";

  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-hidden">
      <section className="relative overflow-hidden">
        <div className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-orange-100 blur-3xl" />
        <div className="absolute -left-32 top-44 h-80 w-80 rounded-full bg-amber-100 blur-3xl" />

        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div>
            <span className="badge">Smart support. Better together.</span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-900 mt-5 leading-tight">
              Your support, well managed.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Create tickets, track progress, collaborate with agents, and keep every request moving
              with clarity and speed.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={getStartedHref} className="btn-primary">Get Started</Link>
              <Link href="/features" className="btn-secondary">Learn More</Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-400" /> Fast & simple
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-400" /> Secure handling
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-400" /> Team ready
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-slate-400">TicketDesk</span>
              </div>
              <div className="grid grid-cols-[150px_1fr] gap-4">
                <div className="rounded-2xl bg-orange-50 border border-orange-100 p-3 space-y-3">
                  {[
                    "Home",
                    "My Tickets",
                    "Create Ticket",
                    "Notifications",
                    "Profile",
                  ].map((item, i) => (
                    <div key={item} className={`text-xs rounded-lg px-2 py-2 ${i === 0 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Welcome back</p>
                      <p className="text-xs text-slate-500">Here is your ticket overview</p>
                    </div>
                    <button className="btn-primary px-3 py-1.5 text-xs">+ New Ticket</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Open", value: 18 },
                      { label: "In Progress", value: 7 },
                      { label: "Resolved", value: 42 },
                      { label: "Closed", value: 96 },
                    ].map(stat => (
                      <div key={stat.label} className="rounded-xl border border-amber-100 bg-white p-3">
                        <p className="text-xs text-slate-500">{stat.label}</p>
                        <p className="text-lg font-semibold">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-amber-100 bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold">Recent tickets</p>
                      <span className="text-xs text-slate-400">View all</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        "Unable to reset password",
                        "Payment not reflecting",
                        "Error on reports page",
                      ].map((t, i) => (
                        <div key={t} className="flex items-center justify-between text-xs text-slate-600">
                          <span className="truncate">{t}</span>
                          <span className={`px-2 py-1 rounded-full text-[10px] ${i === 0 ? "bg-orange-50 text-orange-600" : i === 1 ? "bg-yellow-50 text-yellow-600" : "bg-green-50 text-green-600"}`}>
                            {i === 0 ? "Open" : i === 1 ? "In Progress" : "Resolved"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
