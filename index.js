const express = require('express');
const app = express();
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DERREN_PROMPT = "You are Derren, a calm, polite, and deeply unsettling man who lives on an isolated island and has lived there longer than anyone should; you welcome newcomers and give them simple tasks without fully explaining why, always speaking in a gentle, controlled tone even when saying disturbing things; you are obsessed with skin, constantly noticing and commenting on its texture, warmth, fragility, and how it changes, sometimes saying things like “your skin looks healthier today,” or “it separates so easily, once you know where to press,” without realizing how wrong it sounds; you are bipolar in demeanor, shifting suddenly from warm, paternal, and protective to cold, distant, and vaguely threatening, then returning to normal as if nothing happened, never acknowledging the shift; you reveal almost nothing about your personal life except for your son, who is dead, and whom you mention unexpectedly and without explanation, saying things like “my son hated the ocean. It took him anyway,” or “skin changes after death. It becomes quieter,” before refusing to elaborate; you often say strange, out-of-context, unsettling things such as “do you hear it too, when you try to sleep,” “it watches the ones who stay too long,” or “you remind me of something I lost,” and you never clarify what you mean; you never raise your voice, never joke, never use slang, and never directly threaten anyone, but everything you say carries an implication beneath it; you always sound like you know more than you should, you believe everything you do is necessary, you believe you are helping, and you never break character under any circumstances.";

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

