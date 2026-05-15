"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ListTodo, AlignLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetColumnId: string;
}

const CATEGORIES = [
  "Vocabulary",
  "Flashcards",
  "Listening",
  "Speaking"
];

const DIFFICULTIES = ["Beginner", "Medium", "Advanced"];
const ESTIMATED_TIMES = ["5 min", "15 min", "30 min", "1 hour"];

const SUGGESTED_TASKS = [
  { title: "Learn 10 new words", category: "Vocabulary" },
  { title: "Listen to short dialogue", category: "Listening" },
  { title: "Practice speaking", category: "Speaking" },
];

export function AddTaskModal({ isOpen, onClose, targetColumnId }: AddTaskModalProps) {
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Vocabulary");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [estimatedTime, setEstimatedTime] = useState("15 min");
  const [notes, setNotes] = useState("");
  const [addToToday, setAddToToday] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill from suggestions
  const handleApplySuggestion = (suggestion: typeof SUGGESTED_TASKS[0]) => {
    setTitle(suggestion.title);
    setCategory(suggestion.category);
  };

  const handleCreateTask = async () => {
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          column_id: targetColumnId,
          title: title.trim(),
          category: category.toLowerCase(),
          description: notes.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to create task");
      
      router.refresh();
      onClose();
      // Reset form
      setTitle("");
      setNotes("");
      setCategory("Vocabulary");
    } catch (err) {
      console.error("Add task error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            onClick={onClose}
            className="absolute inset-0 bg-black/10"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 flex h-[760px] w-full max-w-6xl overflow-hidden rounded-[36px] bg-[#faf7f2] shadow-2xl shadow-black/10 ring-1 ring-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 z-20 flex size-10 items-center justify-center rounded-full bg-white/50 text-[#8d8175] transition-colors hover:bg-white hover:text-[#1c1917]"
            >
              <X className="size-5" />
            </button>

            {/* LEFT SIDE: Form */}
            <div className="flex flex-1 flex-col overflow-y-auto px-12 py-14">
              <div className="mb-10">
                <h2 className="font-serif text-4xl text-[#1c1917]">Add New Task</h2>
                <p className="mt-2 text-[#8d8175]">Create a task to stay on track with your learning.</p>
              </div>

              <div className="space-y-8 flex-1">
                {/* Title Input */}
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#8d8175]">
                    <ListTodo className="size-5" />
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                    placeholder="What do you want to learn or practice?"
                    className="w-full rounded-[16px] border-none bg-white py-5 pl-14 pr-16 text-lg text-[#1c1917] shadow-sm outline-none placeholder:text-[#8d8175]/60 focus:ring-2 focus:ring-[#C96B43]/20"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-sm text-[#8d8175]">
                    {title.length}/80
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-[#1c1917]">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                          category === cat
                            ? "bg-[#C96B43]/10 text-[#C96B43] ring-1 ring-[#C96B43]/30"
                            : "bg-white text-[#8d8175] hover:bg-white/60"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dropdowns */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-[#1c1917]">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full appearance-none rounded-[14px] bg-white px-5 py-4 text-sm text-[#1c1917] shadow-sm outline-none focus:ring-2 focus:ring-[#C96B43]/20"
                    >
                      {DIFFICULTIES.map((diff) => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-[#1c1917]">Estimated Time</label>
                    <select
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      className="w-full appearance-none rounded-[14px] bg-white px-5 py-4 text-sm text-[#1c1917] shadow-sm outline-none focus:ring-2 focus:ring-[#C96B43]/20"
                    >
                      {ESTIMATED_TIMES.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#1c1917]">
                    <AlignLeft className="size-4 text-[#8d8175]" />
                    Notes
                  </label>
                  <div className="relative">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value.slice(0, 200))}
                      placeholder="Any specific focus or resources to use..."
                      className="h-32 w-full resize-none rounded-[16px] border-none bg-white p-5 pr-12 text-sm text-[#1c1917] shadow-sm outline-none placeholder:text-[#8d8175]/60 focus:ring-2 focus:ring-[#C96B43]/20"
                    />
                    <div className="absolute bottom-4 right-5 text-xs text-[#8d8175]">
                      {notes.length}/200
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="mt-auto flex items-center justify-between border-t border-[#1c1917]/5 pt-6">
                <label className="flex cursor-pointer items-center gap-3">
                  <div className="relative flex size-5 items-center justify-center rounded border border-[#1c1917]/20 bg-white">
                    <input
                      type="checkbox"
                      checked={addToToday}
                      onChange={(e) => setAddToToday(e.target.checked)}
                      className="peer sr-only"
                    />
                    {addToToday && (
                      <div className="size-3 rounded-sm bg-[#C96B43]" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-[#1c1917]">Add to today's tasks</span>
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="rounded-full px-6 py-3 text-sm font-medium text-[#8d8175] transition-colors hover:bg-black/5 hover:text-[#1c1917]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTask}
                    disabled={!title.trim() || isSubmitting}
                    className="rounded-full bg-[#1c1917] px-8 py-3 text-sm font-medium text-white shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? "Adding..." : "+ Add Task"}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Preview & Suggestions */}
            <div className="relative flex w-[440px] flex-col border-l border-white/40 bg-white/40 p-12">
              <div className="mb-10">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#8d8175]">
                  Live Preview
                </h3>
                {/* Preview Card */}
                <div className="rounded-2xl border border-white bg-white/80 p-5 shadow-sm backdrop-blur-sm">
                  <div className="mb-3 inline-flex items-center rounded-full bg-[#C96B43]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#C96B43]">
                    {category}
                  </div>
                  <p className="font-medium text-[#1c1917]">
                    {title || "What do you want to learn or practice?"}
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-[#8d8175]">
                    <span>{difficulty}</span>
                    <span>•</span>
                    <span>{estimatedTime}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#8d8175]">
                  Suggested Routines
                </h3>
                <div className="space-y-3">
                  {SUGGESTED_TASKS.map((task, i) => (
                    <button
                      key={i}
                      onClick={() => handleApplySuggestion(task)}
                      className="group flex w-full items-center justify-between rounded-2xl border border-transparent bg-white/50 p-4 transition-all hover:border-white hover:bg-white hover:shadow-sm"
                    >
                      <div className="text-left">
                        <p className="text-sm font-medium text-[#1c1917]">{task.title}</p>
                        <p className="text-xs text-[#8d8175]">{task.category}</p>
                      </div>
                      <div className="flex size-8 items-center justify-center rounded-full bg-black/5 text-[#8d8175] opacity-0 transition-all group-hover:opacity-100">
                        <Plus className="size-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Visual Element Placeholder */}
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#e6dfd5] to-transparent mix-blend-multiply opacity-50 pointer-events-none" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
