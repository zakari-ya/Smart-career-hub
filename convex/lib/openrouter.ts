
const AI_MODEL = "openai/gpt-oss-120b:free";

export const callOpenRouter = async (systemPrompt: string, userPrompt: string) => {
  let retries = 3;
  while (retries > 0) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER || "https://smartcareerhub.com",
        },
          body: JSON.stringify({
            model: AI_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            max_tokens: 3000,
            temperature: 0.2,
            response_format: { type: "json_object" },
          }),
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`OpenRouter Error (${response.status}):`, errorBody);
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error("Empty response from AI model");
      }

      // Sometimes models wrap JSON in markdown block: ```json ... ```
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      return JSON.parse(content);
    } catch (err) {
      retries--;
      if (retries === 0) throw err;
      // Sleep for 1s
      await new Promise(r => setTimeout(r, 1000));
    }
  }
};
