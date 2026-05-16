import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are a world-class language learning AI. Generate flashcards as STRICT JSON array.

Rules:
- Return ONLY a valid JSON array, no markdown, no explanations, no code fences.
- Each object MUST have: "word", "translation", "transcription", "example", "example_translation", "tags", "difficulty"
- Tags: always 2-3 relevant tags from: daily, business, travel, slang, academic, ielts, conversation, formal, informal, technology, culture, food, nature, emotions, health, education, media, sports, arts, science
- Difficulty: A1, A2, B1, B2, C1, C2
- Examples must be natural and contextual with translation.
- No duplicates in the same response.
- Adapt difficulty to the requested level.`;

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

    const { language, topic, count, level } = await req.json();

    if (!language || !topic || !count || !level) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    if (!validLevels.includes(level)) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }

    const countNum = Math.min(Math.max(parseInt(count, 10) || 10, 5), 100);

    const langInstruction: Record<string, string> = {
      english: "Generate English vocabulary with IPA transcription and translation in Russian.",
      chinese: "Generate Chinese vocabulary (Simplified) with pinyin transcription and translation in Russian.",
      spanish: "Generate Spanish vocabulary with IPA transcription, gender indication (masculine/feminine) and translation in Russian.",
      french: "Generate French vocabulary with IPA transcription, gender indication (masculine/feminine) and translation in Russian.",
    };

    const userPrompt = `Language: ${language}
Topic: ${topic}
Level: ${level}
Count: ${countNum}

${langInstruction[language.toLowerCase()] || `Generate vocabulary in ${language} with transcription and translation in Russian.`}

Return exactly ${countNum} flashcards as a JSON array. Each object: { "word", "translation", "transcription", "example", "example_translation", "tags": [], "difficulty": "${level}" }`;

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

    // Clean potential markdown fences
    content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let cards: unknown[];
    try {
      const parsed = JSON.parse(content);
      cards = parsed.cards || parsed.flashcards || parsed.data || parsed;
      if (!Array.isArray(cards)) throw new Error("Not an array");
    } catch {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 502 });
    }

    // Normalize
    const seen = new Set<string>();
    const normalized = (cards as Array<Record<string, unknown>>)
      .filter((c) => c.word && c.translation)
      .map((c) => ({
        word: String(c.word).trim(),
        translation: String(c.translation).trim(),
        transcription: c.transcription ? String(c.transcription).trim() : null,
        example: c.example ? String(c.example).trim() : null,
        example_translation: c.example_translation ? String(c.example_translation).trim() : null,
        difficulty: validLevels.includes(String(c.difficulty)) ? String(c.difficulty) : level,
        tags: Array.isArray(c.tags) ? c.tags.map((t: unknown) => String(t).toLowerCase().replace(/^#/, "")) : [],
      }))
      .filter((c) => {
        const key = c.word.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    return NextResponse.json({ cards: normalized, total: normalized.length });
  } catch (err) {
    console.error("Flashcard generation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
