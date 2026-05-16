import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: goals, error } = await supabase
      .from("user_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ goals });
  } catch (err) {
    console.error("Goals fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const { title, description, category, priority, target, deadline } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const { data: goal, error } = await supabase
      .from("user_goals")
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        category: category || "custom",
        priority: priority || "medium",
        target: target || null,
        deadline: deadline || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ goal }, { status: 201 });
  } catch (err) {
    console.error("Goal create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
