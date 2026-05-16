import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { words } = body;

    if (!Array.isArray(words) || words.length === 0) {
      return NextResponse.json({ error: "Missing words array" }, { status: 400 });
    }

    const records = words.map((w: { word: string; translation: string; transcription?: string; example?: string; language: string; level?: string; tags?: string[] }) => ({
      user_id: user.id,
      word: w.word,
      translation: w.translation,
      transcription: w.transcription || null,
      example: w.example || null,
      language: w.language?.toLowerCase() || "english",
      level: w.level || "A1",
      tags: w.tags || [],
      status: "learning",
      mastery_level: 0,
      source: "ai_generated",
    }));

    // Upsert to avoid duplicates (same user, word, language)
    const { data, error } = await supabase
      .from("vocabulary_words")
      .upsert(records, {
        onConflict: "user_id, word, language",
        ignoreDuplicates: false,
      })
      .select("id, word, status, mastery_level");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, saved: data });
  } catch (err) {
    console.error("Vocabulary POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const status = searchParams.get("status");

    let query = supabase
      .from("vocabulary_words")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (language) {
      query = query.eq("language", language.toLowerCase());
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ words: data });
  } catch (err) {
    console.error("Vocabulary GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, mastery_level, ease_factor, interval_days, next_review_at, correct_count, review_count } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing word id" }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (typeof mastery_level === "number") updates.mastery_level = mastery_level;
    if (typeof ease_factor === "number") updates.ease_factor = ease_factor;
    if (typeof interval_days === "number") updates.interval_days = interval_days;
    if (next_review_at) updates.next_review_at = next_review_at;
    if (typeof correct_count === "number") updates.correct_count = correct_count;
    if (typeof review_count === "number") updates.review_count = review_count;

    const { error } = await supabase
      .from("vocabulary_words")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Vocabulary PATCH error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearLearning = searchParams.get("clearLearning") === "true";

    // Bulk clear: remove all learning/unassigned words
    if (clearLearning) {
      const { error, count } = await supabase
        .from("vocabulary_words")
        .delete({ count: "exact" })
        .eq("user_id", user.id)
        .or("status.eq.learning,status.is.null");

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, deleted: count || 0 });
    }

    // Single word delete
    if (!id) {
      return NextResponse.json({ error: "Missing word id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("vocabulary_words")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Vocabulary DELETE error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

