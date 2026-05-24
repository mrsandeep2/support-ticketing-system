"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthUser, clearAuth, getUser } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [u, setU] = useState<AuthUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  useEffect(() => { setU(getUser()); }, [pathname]);

  const marketingLinks = useMemo(() => ([
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "How it works", href: "/how-it-works" },
    { label: "About", href: "/about" },
  ]), []);

  function logout() {
    clearAuth();
    setU(null);
    router.push("/login");
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href;
  }

  function isTicketsActive() {
    return pathname.startsWith("/tickets") && pathname !== "/tickets/new";
  }

  function isUsersActive() {
    return pathname === "/admin/users";
  }

  const signInActive = pathname === "/login";
  const getStartedActive = pathname === "/signup";
  const isAppRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/tickets") || pathname.startsWith("/admin");

  function Logo() {
    return (
      <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 7.5h14M7.5 5v14M16.5 5v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M8 9.5h8v7H8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className="text-lg">TicketDesk</span>
      </Link>
    );
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-amber-100/70 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        {!u && (
          <>
            <Logo />
            <div className="hidden md:flex items-center gap-6 text-sm">
              {marketingLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${isActive(link.href) ? "nav-link-active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className={`btn-ghost ${signInActive ? "text-orange-600" : ""}`}>Sign In</Link>
              <Link href="/login" className={`btn-primary ${getStartedActive ? "ring-2 ring-orange-200" : ""}`}>Get Started</Link>
            </div>

            <button
              className="md:hidden inline-flex items-center justify-center rounded-xl border border-amber-200/70 bg-white px-3 py-2"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen(v => !v)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
          </>
        )}

        {u && (
          isAppRoute ? (
            <div className="grid grid-cols-[auto_1fr_auto] items-center w-full gap-6">
              <Logo />
              <div className="flex items-center justify-center gap-8 text-sm">
                <Link href="/" className={`nav-link ${isActive("/") ? "nav-link-active" : ""}`}>Home</Link>
                <Link href="/dashboard" className={`nav-link ${isActive("/dashboard") ? "nav-link-active" : ""}`}>Dashboard</Link>
                <Link href="/tickets" className={`nav-link ${isTicketsActive() ? "nav-link-active" : ""}`}>Tickets</Link>
                {u.role === "ADMIN" && (
                  <Link href="/admin/users" className={`nav-link ${isUsersActive() ? "nav-link-active" : ""}`}>Users</Link>
                )}
              </div>
              <div className="flex items-center gap-3 justify-self-end">
                <Link href="/tickets/new" className="btn-primary">+ New Ticket</Link>
                <div className="relative">
                  <button
                    className="btn-ghost border border-amber-200/70"
                    onClick={() => setProfileOpen(v => !v)}
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                  >
                    Profile
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-amber-100 bg-white shadow-lg p-3 text-sm">
                      <div className="text-slate-700 font-medium">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.role}</div>
                    </div>
                  )}
                </div>
                <button onClick={logout} className="btn-secondary">Logout</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[auto_1fr_auto] items-center w-full gap-6">
              <Logo />
              <div className="flex items-center justify-center gap-6 text-sm">
                {marketingLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link ${isActive(link.href) ? "nav-link-active" : ""}`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/dashboard" className={`nav-link ${isActive("/dashboard") ? "nav-link-active" : ""}`}>Dashboard</Link>
              </div>
              <div className="flex items-center gap-3 justify-self-end">
                <button onClick={logout} className="btn-secondary">Logout</button>
              </div>
            </div>
          )
        )}
      </div>

      {!u && mobileOpen && (
        <div className="md:hidden border-t border-amber-100/70 bg-white/90">
          <div className="px-4 py-3 space-y-2 text-sm">
            {marketingLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`block nav-link ${isActive(link.href) ? "nav-link-active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 flex gap-2">
              <Link href="/login" className={`btn-ghost ${signInActive ? "text-orange-600" : ""}`} onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link href="/login" className={`btn-primary ${getStartedActive ? "ring-2 ring-orange-200" : ""}`} onClick={() => setMobileOpen(false)}>Get Started</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
