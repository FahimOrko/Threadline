import { NextResponse, type NextRequest } from "next/server";
import { customerViewRedirect } from "@/lib/selection";

// The dashboard is the KAM's workspace (ADR 0023). Any dashboard URL in customer view goes to the game; the decision lives in selection.ts.
export function proxy(request: NextRequest) {
  const to = customerViewRedirect(request.nextUrl);
  return to ? NextResponse.redirect(new URL(to, request.url)) : NextResponse.next();
}

export const config = { matcher: "/dashboard/:path*" };
