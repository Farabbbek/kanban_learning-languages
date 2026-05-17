import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Count consecutive days where the user opened a study session.
  // A session is created on dashboard entry, so today's visit should count
  // immediately instead of waiting until the tab is closed and marked completed.
  const { data: sessions } = await supabase
    .from("study_sessions")
    .select("session_date")
    .eq("user_id", user.id)
    .order("session_date", { ascending: false });

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ streak: 0 });
  }

  // Deduplicate dates
  const uniqueDates = [
    ...new Set(sessions.map((s) => s.session_date)),
  ].sort((a, b) => b.localeCompare(a)); // newest first

  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];

  // Must have studied today or yesterday to start streak
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return NextResponse.json({ streak: 0 });
  }

  // Count consecutive days
  const checkDate = new Date(uniqueDates[0]);
  for (const dateStr of uniqueDates) {
    const expected = checkDate.toISOString().split("T")[0];
    if (dateStr === expected) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return NextResponse.json({ streak });
}
