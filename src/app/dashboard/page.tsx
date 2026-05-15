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

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch user languages
  const { data: userLanguages } = await supabase
    .from("user_languages")
    .select("*, language:languages(name, flag_emoji)")
    .eq("user_id", user.id);

  // Fetch recent quizzes
  const { data: recentQuizzes } = await supabase
    .from("quiz_attempts")
    .select("*, quiz:quizzes(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch vocabulary count
  const { count: vocabCount } = await supabase
    .from("vocabulary")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Fetch today's study session
  const today = new Date().toISOString().split("T")[0];
  const { data: todaySessions } = await supabase
    .from("study_sessions")
    .select("duration_minutes")
    .eq("user_id", user.id)
    .eq("session_date", today);

  const todayMinutes = todaySessions?.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0) ?? 0;

  // Fetch due reviews (vocabulary with next_review_at <= now)
  const { count: dueReviews } = await supabase
    .from("vocabulary")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .lte("next_review_at", new Date().toISOString())
    .neq("column_status", "mastered");

  // Fetch quizzes completed count
  const { count: quizzesCompleted } = await supabase
    .from("quiz_attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("completed", true);

  // Fetch task boards with columns
  const { data: taskBoards } = await supabase
    .from("task_boards")
    .select("*, task_columns(*)")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  // Fetch tasks for each board
  let tasks: any[] = [];
  if (taskBoards && taskBoards.length > 0) {
    const boardIds = taskBoards.map((b) => b.id);
    const { data: fetchedTasks } = await supabase
      .from("tasks")
      .select("*")
      .in(
        "column_id",
        taskBoards.flatMap((b) => b.task_columns?.map((c: any) => c.id) ?? [])
      )
      .eq("user_id", user.id)
      .order("position", { ascending: true });
    tasks = fetchedTasks ?? [];
  }

  // Serialize for client
  const serializedTasks = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description ?? undefined,
    category: t.category,
    progress: t.progress,
    column_id: t.column_id,
    position: t.position,
  }));

  const serializedBoards = (taskBoards ?? []).map((b) => ({
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
  const streak = userLanguages?.reduce((max, ul) => Math.max(max, ul.streak_days), 0) ?? 0;
  const wordsLearned = vocabCount ?? 0;
  const dailyGoal = profile?.daily_goal_minutes ?? 20;

  return (
    <DashboardClient
      displayName={displayName}
      streak={streak}
      todayMinutes={todayMinutes}
      dailyGoal={dailyGoal}
      wordsLearned={wordsLearned}
      quizzesCompleted={quizzesCompleted ?? 0}
      dueReviews={dueReviews ?? 0}
      boards={serializedBoards}
      userLanguages={(userLanguages ?? []).map((ul) => ({
        id: ul.id,
        name: (ul.language as any)?.name ?? "Language",
        flag: (ul.language as any)?.flag_emoji ?? "🌍",
        proficiency: ul.proficiency_level,
        streakDays: ul.streak_days,
      }))}
      recentQuizzes={(recentQuizzes ?? []).map((a) => ({
        id: a.id,
        title: (a.quiz as any)?.title ?? "Quiz",
        correctCount: a.correct_count,
        totalQuestions: a.total_questions,
        completed: a.completed,
        score:
          a.total_questions > 0
            ? Math.round((a.correct_count / a.total_questions) * 100)
            : 0,
      }))}
      vocabByDifficulty={{
        beginner: 0,
        intermediate: 0,
        advanced: 0,
      }}
    />
  );
}
