import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { authenticateRequest } from "@/lib/auth";
import { logError } from "@/lib/server-log";

const ANALYZE_PROMPT = `Analyze this food photo. Return ONLY valid JSON, no explanation, no markdown.
{
  "foods": [
    {"name_ja": "食品名", "name_en": "Food name", "portion": "amount", "calories": number, "protein": number, "carbs": number, "fat": number}
  ],
  "total_calories": number,
  "total_protein": number,
  "total_carbs": number,
  "total_fat": number
}
- calories/protein/carbs/fat are all numbers (grams for macros)
- If you cannot identify food, return empty foods array with zeros`;

/**
 * POST /api/meal/analyze
 * Body: { image_base64: string, image_type: string }
 * Returns: AnalyzeResponse JSON
 *
 * Uses @google/genai SDK (gemini-2.5-flash) — migrated from deprecated
 * @google/generative-ai SDK on 2026-04-18 after MealPact app review reject.
 */
export async function POST(req: NextRequest) {
  const address = authenticateRequest(req);
  if (!address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { image_base64?: string; image_type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { image_base64, image_type } = body;
  if (!image_base64 || !image_type) {
    return NextResponse.json(
      { error: "Missing image_base64 or image_type" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logError("api/meal/analyze", "GEMINI_API_KEY not configured");
    return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: image_type,
            data: image_base64,
          },
        },
        { text: ANALYZE_PROMPT },
      ],
    });

    const text = (response.text ?? "").trim();
    if (!text) {
      logError("api/meal/analyze", "Empty response from Gemini");
      return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
    }

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (err) {
    logError("api/meal/analyze", "Gemini error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
