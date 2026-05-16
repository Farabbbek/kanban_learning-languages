import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const language = searchParams.get("language");

    let base = supabase.from("vocabulary_words").select("status", { count: "exact", head: true }).eq("user_id", user.id);
    if (language) base = base.eq("language", language.toLowerCase());

    const [learning, known, favorite] = await Promise.all([
      base.eq("status", "learning"),
      base.eq("status", "known"),
      base.eq("status", "favorite"),
    ].map((q) => q));

    return NextResponse.json({
      learning: learning.count ?? 0,
      known: known.count ?? 0,
      favorite: favorite.count ?? 0,
    });
  } catch (err) {
    console.error("Vocabulary counts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
