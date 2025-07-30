// server.js (Express route example)
import { Configuration, OpenAIApi } from "openai";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json());

const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(config);

app.post("/api/gpt", async (req, res) => {
  try {
    const { prompt, biteSize } = req.body;
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: biteSize === 'small'
            ? "Respond succinctly in 2–3 short sentences."
            : biteSize === 'medium'
            ? "Respond in moderate length, a few paragraphs."
            : "Respond in detailed, longer explanation." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: biteSize === 'small' ? 150 : biteSize === 'medium' ? 300 : 500
    });
    res.json({ message: response.data.choices[0].message.content });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("GPT proxy listening on port 3000"));