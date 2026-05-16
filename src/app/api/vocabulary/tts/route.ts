import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

/**
 * Premium TTS API Route
 *
 * Primary: ElevenLabs (eleven_multilingual_v2 — 29 languages, neural quality)
 * Fallback: Browser speechSynthesis (macOS Siri voices)
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

let elevenlabs: ElevenLabsClient | null = null;
if (ELEVENLABS_API_KEY) {
  elevenlabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });
}

// Voice IDs per language — you can add your own ElevenLabs custom voices here
// Default uses "Rachel" (21m00Tcm4TlvDq8ikWAM) for most languages since
// eleven_multilingual_v2 handles any language with any voice.
// For best results, use language-specific cloned voices.
const VOICE_MAP: Record<string, string> = {
  english:   "JBFqnCBsd6RMkjVDRZzb", // the voice from your example
  french:    "JBFqnCBsd6RMkjVDRZzb", // multilingual voice handles French
  spanish:   "JBFqnCBsd6RMkjVDRZzb", // multilingual voice handles Spanish
  chinese:   "JBFqnCBsd6RMkjVDRZzb", // multilingual voice handles Chinese
  japanese:  "JBFqnCBsd6RMkjVDRZzb",
  korean:    "JBFqnCBsd6RMkjVDRZzb",
  german:    "JBFqnCBsd6RMkjVDRZzb",
  italian:   "JBFqnCBsd6RMkjVDRZzb",
  portuguese:"JBFqnCBsd6RMkjVDRZzb",
  russian:   "JBFqnCBsd6RMkjVDRZzb",
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, language = "english", speed = 1.0 } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // 1. Try ElevenLabs (premium neural TTS)
    if (elevenlabs) {
      try {
        const voiceId = VOICE_MAP[language.toLowerCase()] || "JBFqnCBsd6RMkjVDRZzb";

        const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
          text: text.trim(),
          modelId: "eleven_multilingual_v2",
          outputFormat: "mp3_44100_128",
        });

        // Convert ReadableStream to Buffer, then base64
        const reader = audioStream.getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        const audioBuffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));

        const base64 = audioBuffer.toString("base64");

        return NextResponse.json({
          audioContent: base64,
          format: "mp3",
          provider: "elevenlabs",
          cached: false,
        });
      } catch (e) {
        console.warn("ElevenLabs TTS error, falling back:", e);
      }
    }

    // 2. Fallback: browser speechSynthesis (macOS Siri voices)
    return NextResponse.json({
      audioContent: null,
      provider: "browser-fallback",
      language,
      text: text.trim(),
      speed,
      cached: false,
      fallback: true,
    });
  } catch (err) {
    console.error("TTS route error:", err);
    return NextResponse.json(
      { audioContent: null, provider: "browser-fallback", fallback: true },
      { status: 200 }
    );
  }
}
