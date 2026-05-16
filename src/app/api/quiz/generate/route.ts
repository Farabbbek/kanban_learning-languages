import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are a world-class language learning AI quiz generator. Generate quiz questions as STRICT JSON.

CRITICAL RULES:
- Return ONLY a valid JSON object with "questions" array, no markdown, no code fences.
- Each question object structure depends on quiz type.
- For "translation" type, each question MUST have: "sourceWord" (in Russian), "correctAnswer" (in target language), "options" (array of 4 strings in target language — ONE is correctAnswer, THREE are plausible but WRONG distractors), "sourceLanguage": "Russian", "targetLanguage": string, "difficulty"
- For other types, each question MUST have: "question", "options" (array of 4 strings — ONE is correctAnswer, THREE are plausible distractors), "correctAnswer", "difficulty"
- Difficulty: A1, A2, B1, B2, C1, C2
- No duplicates in the same response.
- Adapt difficulty to the requested level.
- THE CORRECT ANSWER MUST BE ONE OF THE OPTIONS. Do NOT list the correct answer separately.
- DISTRACTORS MUST BE PLAUSIBLE but clearly wrong — for vocabulary quizzes, use real words that a learner might confuse, not random strings.`;

const LANGUAGE_NAMES: Record<string, string> = {
  english: "English",
  chinese: "Chinese",
  spanish: "Spanish",
  french: "French",
};

/** Shuffle array in-place (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Ensure correctAnswer is in options, otherwise insert it */
function ensureCorrectInOptions(options: string[], correctAnswer: string): string[] {
  const trimmed = options.map((o) => String(o).trim()).filter(Boolean);
  const lowerOpts = trimmed.map((o) => o.toLowerCase());

  // Check if correctAnswer is already in options (case-insensitive)
  if (lowerOpts.includes(correctAnswer.trim().toLowerCase())) {
    // Replace any duplicate with the exact correctAnswer
    return trimmed.map((o, i) =>
      lowerOpts[i] === correctAnswer.trim().toLowerCase() ? correctAnswer.trim() : o
    );
  }

  // Not found — replace first option with correctAnswer
  if (trimmed.length >= 1) {
    trimmed[0] = correctAnswer.trim();
  } else {
    trimmed.push(correctAnswer.trim());
  }

  return trimmed;
}

export async function POST(req: NextRequest) {
  try {
    if (!DEEPSEEK_KEY && !GEMINI_KEY) {
      return NextResponse.json(
        { error: "AI service not configured. Set DEEPSEEK_API_KEY or GEMINI_API_KEY in .env.local" },
        { status: 501 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { language, quizType, topic, count, level } = await req.json();

    if (!language || !quizType || !topic || !count || !level) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    if (!validLevels.includes(level)) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }

    const countNum = Math.min(Math.max(parseInt(count, 10) || 5, 3), 50);
    const targetLangName = LANGUAGE_NAMES[language?.toLowerCase()] || "English";

    const typeInstructions: Record<string, string> = {
      translation: `TRANSLATION QUIZ — The user's native language is Russian. They are learning ${targetLangName}.

STRICT RULES FOR TRANSLATION:
- "sourceWord" = a Russian word (e.g. "собака", "книга", "бежать")
- "correctAnswer" = the ${targetLangName} translation of that Russian word
- "options" = EXACTLY 4 strings in ${targetLangName}. One is the correctAnswer, the other 3 are PLAUSIBLE but wrong translations that a learner might confuse.
- "sourceLanguage": "Russian"
- "targetLanguage": "${targetLangName}"
- DIFFICULTY drives word complexity: A1=basic nouns/verbs, A2=common phrases, B1=intermediate vocab, B2=advanced, C1=idiomatic, C2=specialized.
- DISTRACTORS MUST BE REAL WORDS in ${targetLangName}, not random strings. They should be semantically related but wrong (e.g. for "собака" = "dog", distractors could be "cat", "fox", "wolf" rather than random unrelated words).

Example for English learner:
{ "sourceWord": "собака", "correctAnswer": "dog", "options": ["dog", "cat", "bird", "fish"], "sourceLanguage": "Russian", "targetLanguage": "English", "difficulty": "A1" }

Example incorrect (DO NOT DO): { "sourceWord": "собака", "correctAnswer": "dog", "options": ["dog", "canine", "doggy", "puppy"] } — these are all correct answers, not distractors.`,
      grammar: `GRAMMAR QUIZ: Present a sentence with a grammatical blank or rule explanation as "question". Provide 4 options as possible grammatical completions. "correctAnswer" is the grammatically correct option. DISTRACTORS must be grammatically incorrect but tempting for a learner (wrong tense, wrong conjugation, wrong word order, etc.). Make sure distractors are plausible mistakes.`,
      "multiple-choice": `MULTIPLE CHOICE: Ask a general language knowledge question about vocabulary, culture, or usage as "question". Provide 4 options. "correctAnswer" is the correct one. DISTRACTORS must be plausible but factually wrong. Avoid making the correct answer obvious by being much longer or shorter than distractors.`,
      "fill-missing": `FILL THE MISSING WORD: Show a sentence with "______" marking the missing word as "question". Provide 4 options. "correctAnswer" is the word that correctly completes the sentence. DISTRACTORS should be words that a learner might plausibly think fits but changes the meaning or is grammatically wrong.`,
      listening: `LISTENING COMPREHENSION: Describe an audio scenario as "question" (e.g. "You hear: 'Could you pass me the salt?'"). Provide 4 possible contextual responses. "correctAnswer" is the best response. DISTRACTORS should be contextually inappropriate but tempting choices.`,
    };

    const userPrompt = `Language: ${language}
Topic: ${topic}
Level: ${level}
Quiz type: ${quizType} — ${typeInstructions[quizType] || "General language quiz with 4 options per question. The correct answer MUST be one of the 4 options. Distractors MUST be plausible."}
Count: ${countNum}

Generate exactly ${countNum} quiz questions as a JSON object with key "questions" containing an array of question objects.

HARD REQUIREMENTS:
1. For TRANSLATION type: { "sourceWord", "correctAnswer", "options": [4 strings], "sourceLanguage": "Russian", "targetLanguage": "${targetLangName}", "difficulty": "${level}" }
2. For OTHER types: { "question", "options": [4 strings], "correctAnswer", "difficulty": "${level}" }
3. The "correctAnswer" MUST be one of the 4 strings in "options".
4. Do NOT make the correctAnswer obvious (avoid it being much longer/shorter, avoid all caps, avoid special markers).
5. Distractors must be realistic and tempting — not random garbage or obviously wrong.`;

    let content: string | null = null;

    // 1. Try DeepSeek
    if (DEEPSEEK_KEY) {
      try {
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DEEPSEEK_KEY}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            response_format: { type: "json_object" },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          content = data.choices?.[0]?.message?.content || null;
        } else {
          const errBody = await response.text();
          console.warn("DeepSeek error, trying Gemini:", errBody.substring(0, 200));
        }
      } catch (e) {
        console.warn("DeepSeek exception:", e);
      }
    }

    // 2. Fallback to Gemini
    if (!content && GEMINI_KEY) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }],
                },
              ],
              generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          content = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || null;
        } else {
          console.error("Gemini error:", await geminiRes.text());
        }
      } catch (e) {
        console.error("Gemini exception:", e);
      }
    }

    if (!content) {
      return NextResponse.json(
        { error: "All AI services failed. Check API keys and quotas." },
        { status: 502 }
      );
    }

    content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let questions: unknown[];
    try {
      const parsed = JSON.parse(content);
      questions = parsed.questions || parsed.quizzes || parsed.data || parsed;
      if (!Array.isArray(questions)) throw new Error("Not an array");
    } catch {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 502 });
    }

    const normalized = (questions as Array<Record<string, unknown>>)
      .filter((q) => {
        if (q.sourceWord) {
          return q.sourceWord && q.correctAnswer && Array.isArray(q.options) && q.options.length >= 2;
        }
        return q.question && Array.isArray(q.options) && q.options.length >= 2 && q.correctAnswer;
      })
      .map((q) => {
        const correctAnswer = String(q.correctAnswer).trim();
        let options = (q.options as string[]).slice(0, 4).map((o: string) => String(o).trim());

        // Ensure correctAnswer is in options, and then shuffle
        options = ensureCorrectInOptions(options, correctAnswer);
        options = shuffle(options);

        const base = {
          correctAnswer,
          options,
          difficulty: validLevels.includes(String(q.difficulty)) ? String(q.difficulty) : level,
        };

        if (q.sourceWord) {
          return {
            ...base,
            sourceWord: String(q.sourceWord).trim(),
            sourceLanguage: String(q.sourceLanguage || "Russian").trim(),
            targetLanguage: String(q.targetLanguage || targetLangName).trim(),
            question: `Translate "${String(q.sourceWord).trim()}"`,
          };
        }

        return {
          ...base,
          question: String(q.question).trim(),
          sourceWord: null,
          sourceLanguage: null,
          targetLanguage: null,
        };
      });

    if (normalized.length === 0) {
      return NextResponse.json(
        { error: "AI returned invalid questions. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ questions: normalized, total: normalized.length });
  } catch (err) {
    console.error("Quiz generation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
