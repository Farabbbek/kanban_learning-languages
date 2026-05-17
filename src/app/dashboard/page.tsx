import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

interface TaskColumnRow {
  id: string;
  title: string;
  color: string;
}

interface TaskBoardRow {
  id: string;
  title: string;
  color: string;
  icon: string;
  task_columns?: TaskColumnRow[] | null;
}

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  priority: number | null;
  estimated_minutes: number | null;
  column_id: string;
  position: number;
}

interface StudySessionRow {
  duration_minutes: number | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = new Date().toISOString().split("T")[0];

  const [profileResult, taskBoardsResult, todaySessionsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, daily_goal_minutes")
      .eq("id", user.id)
      .single(),
    supabase
      .from("task_boards")
      .select("*, task_columns(*)")
      .eq("user_id", user.id)
      .order("position", { ascending: true }),
    supabase
      .from("study_sessions")
      .select("duration_minutes")
      .eq("user_id", user.id)
      .eq("session_date", today),
  ]);

  const profile = profileResult.data;
  const taskBoardRows = taskBoardsResult.data;
  const todaySessions = todaySessionsResult.data;
  let taskBoards = taskBoardRows as TaskBoardRow[] | null;

  // Auto-create default board if none exists
  if (!taskBoards || taskBoards.length === 0) {
    const { data: newBoard } = await supabase
      .from("task_boards")
      .insert({
        user_id: user.id,
        title: "Learning",
        color: "#c56b47",
        icon: "📋",
        position: 0,
      })
      .select()
      .single();

    if (newBoard) {
      const defaultColumns = [
        { title: "To Do", position: 0, color: "#8d8175" },
        { title: "In Progress", position: 1, color: "#c56b47" },
        { title: "Done", position: 2, color: "#2d7a4a" },
      ];

      for (const col of defaultColumns) {
        await supabase.from("task_columns").insert({
          board_id: newBoard.id,
          ...col,
        });
      }

      const { data: boardWithColumns } = await supabase
        .from("task_boards")
        .select("*, task_columns(*)")
        .eq("id", newBoard.id)
        .single();

      taskBoards = boardWithColumns ? [boardWithColumns as TaskBoardRow] : [];
    }
  }

  // Fetch tasks for the first board
  let tasks: TaskRow[] = [];
  if (taskBoards && taskBoards.length > 0) {
    const { data: fetchedTasks } = await supabase
      .from("tasks")
      .select("*")
      .in(
        "column_id",
        taskBoards[0].task_columns?.map((c) => c.id) ?? []
      )
      .eq("user_id", user.id)
      .order("position", { ascending: true });
    tasks = (fetchedTasks as TaskRow[] | null) ?? [];
  }

  // Serialize
  const serializedTasks = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description ?? undefined,
    tags: t.tags ?? [],
    priority: t.priority ?? 2,
    estimated_minutes: t.estimated_minutes ?? undefined,
    column_id: t.column_id,
    position: t.position,
  }));

  const serializedBoards = (taskBoards ?? []).map((b) => ({
    id: b.id,
    title: b.title,
    color: b.color,
    icon: b.icon,
    columns: (b.task_columns ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      color: c.color,
      tasks: serializedTasks.filter((t) => t.column_id === c.id),
    })),
  }));

  const displayName = profile?.display_name ?? user.email?.split("@")[0] ?? "Learner";
  const dailyGoal = profile?.daily_goal_minutes ?? 20;

  const todayMinutes =
    (todaySessions as StudySessionRow[] | null)?.reduce(
      (sum, s) => sum + (s.duration_minutes ?? 0),
      0
    ) ?? 0;

  return (
    <DashboardClient
      displayName={displayName}
      todayMinutes={todayMinutes}
      dailyGoal={dailyGoal}
      boards={serializedBoards}
    />
  );
}
