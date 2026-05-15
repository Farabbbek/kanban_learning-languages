import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Brain, Clock, Dumbbell, Sparkles } from "lucide-react";

export default async function QuizzesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*, language:languages(name, flag_emoji)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#f8f3ee]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#e5dcd1]/30 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <ArrowLeft className="size-4 text-[#8d8175]" />
            <span className="text-sm font-medium text-[#8d8175]">Back to Dashboard</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-full px-4 py-2 text-xs font-semibold text-[#8d8175] transition-colors hover:text-[#0a0a0a]"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/vocabulary"
              className="rounded-full px-4 py-2 text-xs font-semibold text-[#8d8175] transition-colors hover:text-[#0a0a0a]"
            >
              Vocabulary
            </Link>
          </nav>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-[1200px] px-6 py-10 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8d8175]/60">
            Practice & Assessment
          </p>
          <h1 className="mt-2 font-heading text-4xl font-medium text-[#0a0a0a]">Quizzes</h1>
          <p className="mt-2 text-sm text-[#8d8175]">
            Test your knowledge across vocabulary, grammar, listening and more
          </p>
        </div>

        {quizzes && quizzes.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.id}
                href={`/dashboard/quizzes/${quiz.id}`}
                className="group rounded-xl border border-[#e5dcd1]/30 bg-white/40 p-6 shadow-[0_4px_16px_rgba(93,64,42,0.04)] transition-all hover:border-[#c56b47]/20 hover:bg-white/60 hover:shadow-[0_12px_40px_rgba(93,64,42,0.08)]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-full bg-[#c56b47]/10">
                    <Brain className="size-5 text-[#c56b47]" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8d8175]/60">
                    {quiz.language?.name ?? "General"}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-medium text-[#0a0a0a]">{quiz.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#8d8175]">
                  {quiz.description ?? "Test your knowledge with this quiz."}
                </p>
                <div className="mt-5 flex items-center gap-4 text-xs text-[#8d8175]">
                  <span className="flex items-center gap-1.5">
                    <Dumbbell className="size-3.5" />
                    {quiz.question_count} questions
                  </span>
                  {quiz.time_limit_minutes && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      {quiz.time_limit_minutes} min
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-1.5 font-semibold text-[#c56b47] opacity-0 transition-opacity group-hover:opacity-100">
                    <Sparkles className="size-3.5" />
                    Start
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#e5dcd1]/40 bg-white/20 p-16 text-center">
            <Brain className="mx-auto mb-4 size-12 text-[#8d8175]/30" />
            <p className="font-heading text-xl font-medium text-[#8d8175]">No quizzes available yet</p>
            <p className="mt-2 text-sm text-[#8d8175]/60">Check back soon for new challenges!</p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-6 py-3 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all hover:shadow-[0_12px_32px_rgba(0,0,0,0.14)]"
            >
              <ArrowLeft className="size-3.5" />
              Back to Dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
