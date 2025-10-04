// Simple Express endpoint to relay chat messages to OpenAI ChatGPT
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// You should set this in your environment for security
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        max_tokens: 150,
      }),
    });
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, no response.';
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from OpenAI', details: err.message });
  }
});

module.exports = router;
