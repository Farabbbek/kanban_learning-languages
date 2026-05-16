"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ListTodo, Clock, AlignLeft } from "lucide-react";
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
  "Speaking",
  "Reading",
  "Writing",
];

const PRIORITIES = [
  { label: "Easy", value: 1 },
  { label: "Medium", value: 2 },
  { label: "Hard", value: 3 },
];

const ESTIMATED_TIMES = [
  { label: "5 min", value: 5 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
];

const SUGGESTED_TASKS = [
  { title: "Learn 15 new words", category: "Vocabulary" },
  { title: "Review flashcards", category: "Flashcards" },
  { title: "Listening practice", category: "Listening" },
  { title: "Watch French lesson", category: "Listening" },
  { title: "Practice speaking", category: "Speaking" },
];

export function AddTaskModal({ isOpen, onClose, targetColumnId }: AddTaskModalProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Vocabulary");
  const [priority, setPriority] = useState(2);
  const [estimatedTime, setEstimatedTime] = useState(15);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          priority,
          estimated_minutes: estimatedTime,
          tags: [category.toLowerCase()],
        }),
      });

      if (!res.ok) throw new Error("Failed to create task");

      router.refresh();
      onClose();
      setTitle("");
      setNotes("");
      setCategory("Vocabulary");
      setPriority(2);
      setEstimatedTime(15);
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/8 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[28px] bg-[#faf7f2] shadow-2xl shadow-black/10 ring-1 ring-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 z-20 flex size-9 items-center justify-center rounded-full bg-white/50 text-[#8d8175] transition-colors hover:bg-white hover:text-[#1c1917]"
            >
              <X className="size-4" />
            </button>

            <div className="flex flex-col overflow-y-auto px-10 py-10">
              <div className="mb-8">
                <h2 className="font-serif text-3xl text-[#1c1917]">New Task</h2>
                <p className="mt-1.5 text-sm text-[#8d8175]">Add something to learn or practice.</p>
              </div>

              <div className="space-y-6">
                {/* Title Input */}
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8d8175]">
                    <ListTodo className="size-4" />
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                    placeholder="What do you want to learn?"
                    className="w-full rounded-[14px] border-none bg-white py-4 pl-12 pr-14 text-base text-[#1c1917] shadow-sm outline-none placeholder:text-[#8d8175]/60 focus:ring-2 focus:ring-[#C96B43]/20"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-[#8d8175]">
                    {title.length}/80
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-[#1c1917]">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                          category === cat
                            ? "bg-[#1c1917] text-white"
                            : "bg-white text-[#8d8175] hover:bg-white/60"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority + Estimated Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-[#1c1917]">
                      Difficulty
                    </label>
                    <div className="flex gap-2">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setPriority(p.value)}
                          className={`flex-1 rounded-[10px] py-2 text-xs font-medium transition-colors ${
                            priority === p.value
                              ? "bg-[#1c1917] text-white"
                              : "bg-white text-[#8d8175] hover:bg-white/60"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-[#1c1917]">
                      <div className="flex items-center gap-2">
                        <Clock className="size-3 text-[#8d8175]" strokeWidth={1.5} />
                        Time
                      </div>
                    </label>
                    <select
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(Number(e.target.value))}
                      className="w-full appearance-none rounded-[10px] bg-white px-4 py-2.5 text-xs text-[#1c1917] shadow-sm outline-none focus:ring-2 focus:ring-[#C96B43]/20"
                    >
                      {ESTIMATED_TIMES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1c1917]">
                    <AlignLeft className="size-3 text-[#8d8175]" strokeWidth={1.5} />
                    Notes
                  </label>
                  <div className="relative">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value.slice(0, 200))}
                      placeholder="Any specific focus or resources..."
                      className="h-24 w-full resize-none rounded-[14px] border-none bg-white p-4 pr-10 text-sm text-[#1c1917] shadow-sm outline-none placeholder:text-[#8d8175]/60 focus:ring-2 focus:ring-[#C96B43]/20"
                    />
                    <div className="absolute bottom-3 right-4 text-xs text-[#8d8175]">
                      {notes.length}/200
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggested tasks */}
              <div className="mt-8">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#8d8175]">
                  Suggested
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TASKS.map((task, i) => (
                    <button
                      key={i}
                      onClick={() => handleApplySuggestion(task)}
                      className="rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium text-[#1c1917] transition-all hover:bg-white hover:shadow-sm"
                    >
                      {task.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="mt-8 flex items-center justify-end gap-3 border-t border-[#1c1917]/5 pt-6">
                <button
                  onClick={onClose}
                  className="rounded-full px-5 py-2.5 text-xs font-medium text-[#8d8175] transition-colors hover:bg-black/5 hover:text-[#1c1917]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!title.trim() || isSubmitting}
                  className="rounded-full bg-[#1c1917] px-6 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? "Adding..." : "+ Add Task"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
