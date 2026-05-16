import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await _request.json();
  const duration_minutes = body.duration_minutes ?? 0;

  const { error } = await supabase
    .from("study_sessions")
    .update({ duration_minutes })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error ticking study session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
