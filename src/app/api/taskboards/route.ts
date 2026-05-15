import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("task_boards")
    .select("*, task_columns(*)")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

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
  const { title, color, icon } = body;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  // Get max position
  const { data: existing } = await supabase
    .from("task_boards")
    .select("position")
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1);

  const position = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { data, error } = await supabase
    .from("task_boards")
    .insert({
      user_id: user.id,
      title,
      color: color ?? "#c56b47",
      icon: icon ?? "📋",
      position,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Auto-create default columns
  const defaultColumns = [
    { title: "To Do", position: 0, color: "#8d8175" },
    { title: "In Progress", position: 1, color: "#c56b47" },
    { title: "Done", position: 2, color: "#2d7a4a" },
  ];

  for (const col of defaultColumns) {
    await supabase.from("task_columns").insert({
      board_id: data.id,
      ...col,
    });
  }

  // Return board with columns
  const { data: boardWithColumns } = await supabase
    .from("task_boards")
    .select("*, task_columns(*)")
    .eq("id", data.id)
    .single();

  return NextResponse.json(boardWithColumns, { status: 201 });
}
