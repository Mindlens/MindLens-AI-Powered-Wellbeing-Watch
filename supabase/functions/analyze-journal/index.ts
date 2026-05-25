const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM = `You are a compassionate student wellbeing analyst. Analyze the journal entry and return a structured JSON object with these fields:
- tone: "Positive" | "Neutral" | "Negative"
- emotions: string[] (e.g. stressed, anxious, hopeful, exhausted)
- stressLevel: number 0-10
- concerns: string[] (key concerns identified)
- suggestions: string[] (exactly 3 personalized, actionable wellness suggestions)
Be warm, specific, and encouraging.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("AI not configured");
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: text },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_analysis",
            description: "Return the journal analysis",
            parameters: {
              type: "object",
              properties: {
                tone: { type: "string", enum: ["Positive", "Neutral", "Negative"] },
                emotions: { type: "array", items: { type: "string" } },
                stressLevel: { type: "number" },
                concerns: { type: "array", items: { type: "string" } },
                suggestions: { type: "array", items: { type: "string" } },
              },
              required: ["tone", "emotions", "stressLevel", "concerns", "suggestions"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_analysis" } },
      }),
    });

    if (!res.ok) {
      const status = res.status === 429 ? 429 : res.status === 402 ? 402 : 500;
      const msg = status === 429 ? "Rate limit reached." : status === 402 ? "AI credits exhausted." : "AI request failed";
      return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await res.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : null;
    if (!parsed) throw new Error("no analysis");

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("analyze-journal error:", err);
    return new Response(JSON.stringify({ error: "AI request failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
