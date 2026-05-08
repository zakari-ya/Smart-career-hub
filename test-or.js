const url = "https://www.linkedin.com/in/zakariya-allaoui";
const prompt = "Please browse the following URL and extract the LinkedIn profile information into JSON: " + url;
fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer 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`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "openai/gpt-oss-120b:free",
    messages: [{ role: "user", content: prompt }]
  })
}).then(r => r.json()).then(console.log);
