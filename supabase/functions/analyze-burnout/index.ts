const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM = `You are a compassionate student wellbeing analyst. Based on the user's answers, return a personalized burnout-risk summary as a JSON object with:
- risk: "Low" | "Moderate" | "High"
- reasons: string[] (key reasons why, specific to their inputs)
- recommendations: string[] (exactly 3 specific, actionable recommendations)
Be warm, specific, and encouraging.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("AI not configured");
    const { context } = await req.json();
    if (!context) {
      return new Response(JSON.stringify({ error: "context required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: typeof context === "string" ? context : JSON.stringify(context) },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_summary",
            description: "Return the burnout summary",
            parameters: {
              type: "object",
              properties: {
                risk: { type: "string", enum: ["Low", "Moderate", "High"] },
                reasons: { type: "array", items: { type: "string" } },
                recommendations: { type: "array", items: { type: "string" } },
              },
              required: ["risk", "reasons", "recommendations"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_summary" } },
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
    if (!parsed) throw new Error("no summary");

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("analyze-burnout error:", err);
    return new Response(JSON.stringify({ error: "AI request failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
