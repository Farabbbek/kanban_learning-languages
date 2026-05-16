import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// DeepSeek (primary) — your OPENAI_API_KEY is actually DeepSeek
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
// Gemini (fallback)
const GEMINI_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are a world-class language learning AI. Generate vocabulary words as JSON.

Rules:
- Return ONLY valid JSON array, no markdown, no explanations.
- Each object: { "word", "translation", "transcription", "example", "level", "tags" }
- Tags: always 2-3 relevant tags from: daily, business, travel, slang, academic, ielts, conversation, formal, informal, technology, culture, food, nature, emotions, health, education, media, sports, arts, science
- Level: A1, A2, B1, B2, C1, C2
- Examples must be natural and contextual.
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

    const languagePromptMap: Record<string, string> = {
      english: "Generate English vocabulary with IPA transcription and translation in Russian.",
      chinese: "Generate Chinese vocabulary (Simplified) with pinyin transcription and translation in Russian.",
      spanish: "Generate Spanish vocabulary with IPA transcription, gender indication (masculine/feminine) and translation in Russian.",
      french: "Generate French vocabulary with IPA transcription, gender indication (masculine/feminine) and translation in Russian.",
    };

    const langInstruction = languagePromptMap[language.toLowerCase()] || 
      `Generate vocabulary in ${language} with transcription and translation in Russian.`;

    const userPrompt = `Language: ${language}
Topic: ${topic}
Level: ${level}
Count: ${countNum}

${langInstruction}

Return exactly ${countNum} words as a JSON array with key "words".`;

    let content: string | null = null;

    // 1. Try DeepSeek (primary — faster, no quota limits)
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
          console.warn("DeepSeek API error, trying Gemini:", errBody.substring(0, 200));
        }
      } catch (e) {
        console.warn("DeepSeek exception, trying Gemini:", e);
      }
    }

    // 2. Fallback to Gemini 2.0 Flash
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
              generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          content = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || null;
        } else {
          const errBody = await geminiRes.text();
          console.error("Gemini API error:", errBody);
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

    let words: unknown[];
    try {
      const parsed = JSON.parse(content);
      words = parsed.words || parsed.vocabulary || parsed.data || parsed;
      if (!Array.isArray(words)) {
        throw new Error("Not an array");
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 502 }
      );
    }

    // Normalize and deduplicate words
    const seen = new Set<string>();
    const normalizedWords = (words as Array<Record<string, unknown>>)
      .filter((w) => w.word && w.translation)
      .map((w) => ({
        word: String(w.word).trim(),
        translation: String(w.translation).trim(),
        transcription: w.transcription ? String(w.transcription).trim() : null,
        example: w.example ? String(w.example).trim() : null,
        level: validLevels.includes(String(w.level)) ? String(w.level) : level,
        tags: Array.isArray(w.tags) 
          ? w.tags.map((t: unknown) => String(t).toLowerCase().replace(/^#/, ""))
          : [],
        language: language.toLowerCase(),
      }))
      .filter((w) => {
        const key = w.word.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    // Check existing vocabulary to avoid duplicates
    const existingWords = await supabase
      .from("vocabulary_words")
      .select("word, language, status, mastery_level, tags")
      .eq("user_id", user.id)
      .eq("language", language.toLowerCase())
      .in(
        "word",
        normalizedWords.map((w) => w.word)
      );

    const existingMap = new Map<string, { status: string; mastery_level: number; tags: string[] }>();
    if (existingWords.data) {
      for (const ex of existingWords.data) {
        existingMap.set(ex.word.toLowerCase(), ex);
      }
    }

    // Insert new, update metadata for existing
    const newWords = normalizedWords.filter(
      (w) => !existingMap.has(w.word.toLowerCase())
    );

    if (newWords.length > 0) {
      const { error: insertError } = await supabase
        .from("vocabulary_words")
        .insert(
          newWords.map((w) => ({
            ...w,
            user_id: user.id,
          }))
        );

      if (insertError) {
        console.error("Insert error:", insertError);
      }
    }

    // Update metadata for existing words
    for (const w of normalizedWords) {
      const existing = existingMap.get(w.word.toLowerCase());
      if (existing) {
        const mergedTags = [...new Set([...existing.tags, ...w.tags])];
        await supabase
          .from("vocabulary_words")
          .update({
            tags: mergedTags,
            metadata: { last_generated: new Date().toISOString() },
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("word", w.word)
          .eq("language", language.toLowerCase());
      }
    }

    return NextResponse.json({
      words: normalizedWords,
      total: normalizedWords.length,
      new: newWords.length,
      existing: normalizedWords.length - newWords.length,
    });
  } catch (err) {
    console.error("Vocabulary generation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
