// No Supabase session middleware needed — using JWT via localStorage
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	return NextResponse.next();
}

export const config = {
	matcher: [],
};
