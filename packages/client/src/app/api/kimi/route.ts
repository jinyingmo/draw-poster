import { NextResponse } from "next/server";
import { KIMI_CONFIG } from "@/config";
import { loadSystemPrompt } from "@/prompts";

export async function POST(request: Request) {
  const { apiKey, baseUrl, model } = KIMI_CONFIG;

  if (!apiKey) {
    return NextResponse.json(
      { error: "缺少 MOONSHOT_API_KEY" },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const canvasWidth =
    typeof body?.canvasWidth === "number" ? body.canvasWidth : 375;
  const canvasHeight =
    typeof body?.canvasHeight === "number" ? body.canvasHeight : 667;

  if (!prompt) {
    return NextResponse.json({ error: "缺少 prompt" }, { status: 400 });
  }

  const systemPrompt = loadSystemPrompt(canvasWidth, canvasHeight);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 1200,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message ?? data?.error ?? "Kimi API 请求失败";
    return NextResponse.json({ error: message }, { status: response.status });
  }

  const content = data?.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ content });
}
