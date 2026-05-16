import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's first active language, or fall back to the default English language
  const { data: userLang } = await supabase
    .from("user_languages")
    .select("language_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .single();

  let languageId: string | null = userLang?.language_id ?? null;

  // If no user language found, get the default English language
  if (!languageId) {
    const { data: defaultLang } = await supabase
      .from("languages")
      .select("id")
      .eq("code", "en")
      .single();
    languageId = defaultLang?.id ?? null;
  }

  if (!languageId) {
    return NextResponse.json({ error: "No language configured" }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("study_sessions")
    .insert({
      user_id: user.id,
      language_id: languageId,
      session_type: "general",
      duration_minutes: 0,
      session_date: today,
      completed: false,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating study session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
