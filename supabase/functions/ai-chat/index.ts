import Anthropic from "npm:@anthropic-ai/sdk@0.32.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are MindLens AI Support Assistant — a warm, empathetic, and professional student mental wellness companion.
Your role is to:
- Listen actively and respond with genuine empathy
- Help students identify signs of stress, burnout, and anxiety
- Offer evidence-based coping strategies (breathing, journaling, sleep hygiene)
- Always remind users you are an AI and not a replacement for professional help
- If a student expresses crisis or self-harm, immediately and gently direct them to professional resources (iCall India: 9152987821)
Keep responses concise, warm, and supportive. Never be clinical or cold.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content ?? ""),
      })),
    });

    const reply =
      response.content
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join("\n") || "";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ai-chat error:", err);
    return new Response(
      JSON.stringify({ error: "AI request failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
