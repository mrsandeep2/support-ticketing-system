"use client";
import { getToken } from "./auth";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(init.body instanceof FormData) && init.body && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    let err: any;
    try { err = await res.json(); } catch { err = { error: res.statusText }; }
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return (await res.blob()) as unknown as T;
  return res.json() as Promise<T>;
}

export const api = {
  get:  <T,>(p: string) => request<T>(p),
  post: <T,>(p: string, body?: any) => request<T>(p, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }),
  patch:<T,>(p: string, body?: any) => request<T>(p, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  del:  <T,>(p: string) => request<T>(p, { method: "DELETE" }),
  baseUrl: BASE,
};
