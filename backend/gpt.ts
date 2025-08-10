import OpenAI from "openai";
import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import { Readable } from "node:stream";

dotenv.config();

const app = express();
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/stt", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded." });
    }

    const stream = Readable.from(req.file.buffer);
    (stream as any).path = req.file.originalname || "audio.webm";

    const result = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: stream as any,
      // language: "zh",
      response_format: "json",
      temperature: 0,
    });

    const text = (result as any).text || "";
    if (!text) return res.status(500).json({ error: "Empty transcription." });

    return res.json({ text });
  } catch (err: any) {
    console.error("STT error:", err?.response?.data ?? err);
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/gpt", async (req, res) => {
  const { prompt, biteSize } = req.body as {
    prompt?: string;
    biteSize?: number;
  };

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'prompt'." });
  }
  if (typeof biteSize !== "number" || biteSize < 0 || biteSize > 1) {
    return res
      .status(400)
      .json({ error: "'biteSize' must be a number between 0.0 and 1.0." });
  }

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

    const choice = completion.choices?.[0];
    if (!choice || !choice.message?.content) {
      throw new Error("GPT response missing content");
    }

    const text = choice.message.content.trim();
    if (!text) throw new Error("Empty content returned by GPT");

    const value = parseFloat(text);
    if (isNaN(value) || value < 0 || value > 1) {
      throw new Error(`GPT returned invalid bite-size: "${text}"`);
    }

    return res.json({ biteSize: parseFloat(value.toFixed(1)) });
  } catch (err: any) {
    console.error("GPT error:", err?.response?.data ?? err);
    return res.status(500).json({ error: err.message });
  }
});


app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    hasKey: Boolean(process.env.OPENAI_API_KEY),
    port: PORT,
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`GPT proxy listening on port ${PORT}`)
);

console.log("[gpt] has OPENAI_API_KEY?", Boolean(process.env.OPENAI_API_KEY));
