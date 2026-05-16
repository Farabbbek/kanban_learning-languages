import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const column_id = searchParams.get("column_id");

  let query = supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  if (column_id) {
    query = query.eq("column_id", column_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { column_id, title, description, priority, category, tags, estimated_minutes } = body;

  console.log("[POST /api/tasks] body:", JSON.stringify(body));

  if (!column_id || !title) {
    console.log("[POST /api/tasks] Missing column_id or title");
    return NextResponse.json({ error: "column_id and title are required" }, { status: 400 });
  }

  // Get the max position in the column
  const { data: existing } = await supabase
    .from("tasks")
    .select("position")
    .eq("column_id", column_id)
    .order("position", { ascending: false })
    .limit(1);

  const position = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  // Prepare tags (combining tags and category)
  const finalTags = [...(tags ?? [])];
  if (category && !finalTags.includes(category)) {
    finalTags.push(category);
  }

  // Try to get board_id from column (for taskflow schema), fallback gracefully
  let boardId: string | undefined;
  const { data: column } = await supabase
    .from("task_columns")
    .select("board_id")
    .eq("id", column_id)
    .single();

  if (column?.board_id) {
    boardId = column.board_id;
  }

  const insertData: Record<string, string | number | string[] | null | undefined> = {
    column_id,
    user_id: user.id,
    title,
    description: description ?? null,
    priority: priority ?? 2,
    tags: finalTags,
    position,
    estimated_minutes: estimated_minutes ?? null,
  };

  // Only add board_id if the column exists (taskflow schema)
  if (boardId) {
    insertData.board_id = boardId;
  }

  console.log("[POST /api/tasks] insert data:", insertData);

  const { data, error } = await supabase
    .from("tasks")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("[POST /api/tasks] Insert Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("[POST /api/tasks] Success:", data.id);
  return NextResponse.json(data, { status: 201 });
}
