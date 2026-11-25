import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/*
 * Opens one private document through a link that works for 60 seconds.
 * The storage rules decide who may: the tradesperson who sent it, or the
 * team. Anyone else gets "not found".
 */
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path") ?? "";
  if (!/^[0-9a-f-]{36}\/[a-z-]+\/[^/]+$/.test(path)) return new NextResponse("Not found", { status: 404 });
  const supabase = await createClient();
  const { data } = await supabase.storage.from("provider-documents").createSignedUrl(path, 60);
  if (!data?.signedUrl) return new NextResponse("Not found", { status: 404 });
  return NextResponse.redirect(data.signedUrl, { headers: { "Cache-Control": "no-store" } });
}
