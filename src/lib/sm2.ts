/**
 * SM-2 Algorithm — Spaced Repetition
 *
 * Based on the SuperMemo SM-2 algorithm.
 * https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

export interface Sm2Result {
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: string; // ISO date
  correctCount: number;
  reviewCount: number;
  status: "learning" | "known";
  masteryLevel: number;
}

interface Sm2Input {
  correct: boolean; // true = Known (swipe right), false = Practice (swipe left)
  currentEaseFactor?: number;
  currentIntervalDays?: number;
  currentCorrectCount?: number;
  currentReviewCount?: number;
  currentMasteryLevel?: number;
}

/**
 * Apply SM-2 algorithm on a review attempt.
 *
 * - Known (correct = true): ease factor increases, interval grows exponentially
 * - Practice (correct = false): ease factor decreases, interval resets to 0 (show tomorrow)
 *
 * Default values (for new words):
 *   easeFactor = 2.5
 *   intervalDays = 0
 *   correctCount = 0
 *   reviewCount = 0
 *   masteryLevel = 0
 */
export function applySm2(input: Sm2Input): Sm2Result {
  const ef = input.currentEaseFactor ?? 2.5;
  const interval = input.currentIntervalDays ?? 0;
  const correctCount = input.currentCorrectCount ?? 0;
  const reviewCount = input.currentReviewCount ?? 0;
  const masteryLevel = input.currentMasteryLevel ?? 0;

  const newReviewCount = reviewCount + 1;

  if (input.correct) {
    // --- KNOWN (swipe right) ---
    const newCorrectCount = correctCount + 1;

    // Calculate new interval using SM-2
    let newInterval: number;
    if (newCorrectCount === 1) {
      newInterval = 1; // Next review: tomorrow
    } else if (newCorrectCount === 2) {
      newInterval = 3; // Next review: in 3 days
    } else {
      newInterval = Math.round(interval * ef); // Grow exponentially
    }

    // Ease factor increases slightly
    const newEf = Math.max(1.3, ef + (0.1 - (5 - 3) * (0.08 + (5 - 3) * 0.02))); // SM-2 formula: EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
    // Simplified: we treat correct as q=5, incorrect as q=0
    const simplifiedEf = Math.max(1.3, ef + 0.1);

    // Mastery level increases (capped at 5)
    const newMasteryLevel = Math.min(5, masteryLevel + 1);

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);
    nextReview.setHours(0, 0, 0, 0);

    return {
      easeFactor: Number(simplifiedEf.toFixed(2)),
      intervalDays: newInterval,
      nextReviewAt: nextReview.toISOString(),
      correctCount: newCorrectCount,
      reviewCount: newReviewCount,
      status: newMasteryLevel >= 2 ? "known" : "learning",
      masteryLevel: newMasteryLevel,
    };
  } else {
    // --- PRACTICE (swipe left) ---
    // Reset interval, decrease ease factor, mastery may decrease
    const newEf = Math.max(1.3, ef - 0.2);
    const newMasteryLevel = Math.max(0, masteryLevel - 1);

    // Show again tomorrow
    const nextReview = new Date();
    nextReview.setHours(0, 0, 0, 0);
    if (nextReview.getTime() <= Date.now()) {
      nextReview.setDate(nextReview.getDate() + 1);
    }

    return {
      easeFactor: Number(newEf.toFixed(2)),
      intervalDays: 0,
      nextReviewAt: nextReview.toISOString(),
      correctCount: correctCount,
      reviewCount: newReviewCount,
      status: newMasteryLevel >= 2 ? "known" : "learning",
      masteryLevel: newMasteryLevel,
    };
  }
}

/**
 * Get count of words due for review today
 */
export function getDueWords(words: Array<{ next_review_at?: string | null }>): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return words.filter((w) => {
    if (!w.next_review_at) return true;
    return new Date(w.next_review_at) <= now;
  }).length;
}
