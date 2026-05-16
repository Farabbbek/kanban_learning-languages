import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile (only what we need)
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, daily_goal_minutes")
    .eq("id", user.id)
    .single();

  // Fetch task boards with columns
  let { data: taskBoards } = await supabase
    .from("task_boards")
    .select("*, task_columns(*)")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

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

      taskBoards = boardWithColumns ? [boardWithColumns] : [];
    }
  }

  // Fetch tasks for the first board
  let tasks: any[] = [];
  if (taskBoards && taskBoards.length > 0) {
    const { data: fetchedTasks } = await supabase
      .from("tasks")
      .select("*")
      .in(
        "column_id",
        taskBoards[0].task_columns?.map((c: any) => c.id) ?? []
      )
      .eq("user_id", user.id)
      .order("position", { ascending: true });
    tasks = fetchedTasks ?? [];
  }

  // Serialize
  const serializedTasks = tasks.map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description ?? undefined,
    tags: t.tags ?? [],
    priority: t.priority ?? 2,
    estimated_minutes: t.estimated_minutes ?? undefined,
    column_id: t.column_id,
    position: t.position,
  }));

  const serializedBoards = (taskBoards ?? []).map((b: any) => ({
    id: b.id,
    title: b.title,
    color: b.color,
    icon: b.icon,
    columns: (b.task_columns ?? []).map((c: any) => ({
      id: c.id,
      title: c.title,
      color: c.color,
      tasks: serializedTasks.filter((t) => t.column_id === c.id),
    })),
  }));

  const displayName = profile?.display_name ?? user.email?.split("@")[0] ?? "Learner";
  const dailyGoal = profile?.daily_goal_minutes ?? 20;

  // Get today's study minutes (compact)
  const today = new Date().toISOString().split("T")[0];
  const { data: todaySessions } = await supabase
    .from("study_sessions")
    .select("duration_minutes")
    .eq("user_id", user.id)
    .eq("session_date", today);
  const todayMinutes = todaySessions?.reduce((sum: number, s: any) => sum + (s.duration_minutes ?? 0), 0) ?? 0;

  // Calculate initial streak from completed sessions
  const { data: streakSessions } = await supabase
    .from("study_sessions")
    .select("session_date")
    .eq("user_id", user.id)
    .eq("completed", true)
    .order("session_date", { ascending: false });

  let initialStreak = 0;
  if (streakSessions && streakSessions.length > 0) {
    const uniqueDates: string[] = [
      ...new Set(streakSessions.map((s: { session_date: string }) => s.session_date)),
    ].sort((a, b) => b.localeCompare(a));
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const yesterdayDate = new Date(now.getTime() - 86400000);
    const yesterdayStr = yesterdayDate.toISOString().split("T")[0];
    if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
      const checkDate = new Date(uniqueDates[0]);
      for (const dateStr of uniqueDates) {
        const expected = checkDate.toISOString().split("T")[0];
        if (dateStr === expected) {
          initialStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else break;
      }
    }
  }

  return (
    <DashboardClient
      displayName={displayName}
      todayMinutes={todayMinutes}
      dailyGoal={dailyGoal}
      boards={serializedBoards}
      initialStreak={initialStreak}
    />
  );
}
