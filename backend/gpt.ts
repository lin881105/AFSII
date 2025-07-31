import OpenAI from "openai";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/gpt", async (req, res) => {
  const { prompt, biteSize } = req.body as {
    prompt?: string;
    biteSize?: number;
  };

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'prompt'." });
  }

  if (typeof biteSize !== "number" || biteSize < 0 || biteSize > 1) {
    return res.status(400).json({ error: "'biteSize' must be a number between 0.0 and 1.0." });
  }

  // Use GPT to adjust the numeric biteSize
  const systemMsg =
    `User has current bite-size: ${biteSize.toFixed(1)} (0.0–1.0). ` +
    `Based on the prompt: "${prompt}", ` +
    `Return only a single float between 0.0 and 1.0 inclusive with exactly one decimal, without any extra spacing, punctuation, or newlines.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 200,
    });

    console.log("Completion:", completion);

    const choice = completion.choices?.[0];
    if (!choice || !choice.message?.content) {
      throw new Error("GPT response missing content");
    }

    const text = completion.choices[0]?.message?.content?.trim() || "";
    console.log("GPT message content:", JSON.stringify(text));
    if (!text) {
      throw new Error("Empty content returned by GPT");
    }
    const value = parseFloat(text);
    console.log("message parsing value:", JSON.stringify(value));

    if (isNaN(value) || value < 0 || value > 1) {
      throw new Error(`GPT returned invalid bite-size: "${text}"`);
    }

    return res.json({ biteSize: parseFloat(value.toFixed(1)) });
  } catch (err: any) {
    console.error("GPT error:", err?.response?.data ?? err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`GPT proxy listening on port ${PORT}`));