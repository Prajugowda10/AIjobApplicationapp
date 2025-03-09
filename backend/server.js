const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/analyze-resume", async (req, res) => {
  try {
    const { resume, jobTitle } = req.body;
    const prompt = `Enhance this resume for a ${jobTitle} position. Provide suggestions for improvement: ${resume}`;
    
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });
    
    res.json({ suggestions: aiResponse.choices[0].message.content });
  } catch (error) {
    console.error("Error analyzing resume:", error);
    res.status(500).json({ error: "AI processing failed" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
