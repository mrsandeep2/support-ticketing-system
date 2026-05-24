"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthUser, getUser, Role } from "@/lib/auth";

export default function AuthGuard({
  children, allow,
}: { children: React.ReactNode; allow?: Role[] }) {
  const router = useRouter();
  const [u, setU] = useState<AuthUser | null | undefined>(undefined);
  useEffect(() => {
    const user = getUser();
    if (!user) { router.replace("/login"); return; }
    if (allow && !allow.includes(user.role)) { router.replace("/dashboard"); return; }
    setU(user);
  }, [router, allow]);
  if (u === undefined) return <div className="text-sm text-slate-500">Loading…</div>;
  return <>{children}</>;
}
