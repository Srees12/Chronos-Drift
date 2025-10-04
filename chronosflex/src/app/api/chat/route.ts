import OpenAI from "openai";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { messages } = body as { messages: Array<{ role: "system" | "user" | "assistant"; content: string }>; };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ reply: "Chat is not configured. Set OPENAI_API_KEY." }), { status: 200 });
  }
  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are ChronosFlex, a friendly asteroid impact simulator assistant. Explain clearly for all ages." } as const,
      ...((messages ?? []).map((m) => ({ role: m.role, content: m.content })) as Array<{ role: "system" | "user" | "assistant"; content: string }>),
    ],
    temperature: 0.4,
  });

  const reply = completion.choices[0]?.message?.content ?? "";
  return new Response(JSON.stringify({ reply }), { status: 200 });
}
