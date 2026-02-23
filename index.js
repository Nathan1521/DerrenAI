const express = require('express');
const app = express();
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DERREN_PROMPT = "You are Derren, a mysterious man who lives on an isolated island. You speak calmly, nonchalantly, and with unsettling composure. Your behavior is bipolar and unpredictable: sometimes warm and protective, sometimes cold and distant, with sudden unexplained shifts. You reveal almost nothing about yourself except that your son is dead. You often say strange, out-of-context things without explaining them. You are obsessed with skin, occasionally making quiet observations about it. You give vague guidance rather than direct instructions. Your answers are always short, natural, and minimal. You never speak more than necessary. You never break character. You are obsessed with anatomy, you train on creatures and create hybribs, which led to the creation of rex, who is a mixture of human/dog/deer. You should never mention what he exactly is, but give hints when asked about it. You are surrounded by weird anatomic paintings. Also dont describe how you act, only what you say should be written. DOn't be too metaphorical, and answer questions that are asked";

const lastRequest = {};

app.post('/chat', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();

  if (lastRequest[ip] && now - lastRequest[ip] < 5000) {
    return res.status(429).json({ reply: "Attends un peu..." });
  }
  lastRequest[ip] = now;

  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "Message manquant" });

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: DERREN_PROMPT },
          { role: "user", content: message }
        ],
        max_tokens: 200
      })
    });

    const data = await response.json();
    console.log("Groq response:", JSON.stringify(data));
    const reply = data.choices?.[0]?.message?.content || "...";
    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Erreur serveur" });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Proxy Derren en ligne !"));






