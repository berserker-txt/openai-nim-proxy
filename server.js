// server.js - Clean OpenAI to NVIDIA NIM API Proxy
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - Keeps the 50mb payload size to prevent 413 errors
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// NVIDIA NIM API configuration
const NIM_API_BASE = process.env.NIM_API_BASE || 'https://integrate.api.nvidia.com/v1';
const NIM_API_KEY = process.env.NIM_API_KEY;

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'Clean NVIDIA NIM Proxy' }));

app.get('/v1/models', (req, res) => {
  res.json({
    object: 'list',
    data: [{ id: 'gpt-4o', object: 'model', created: Date.now(), owned_by: 'nvidia-nim-proxy' }]
  });
});

// Chat completions endpoint (Standard Pass-Through)
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const { messages, temperature, max_tokens, stream } = req.body;
    
    // Hardcoded directly to Gemma 4 31B
    const nimModel = 'google/gemma-4-31b-it';
    
    const nimRequest = {
      model: nimModel,
      messages: messages,
      temperature: temperature || 0.6,
      max_tokens: max_tokens || 9024,
      stream: stream || false
    };

    const response = await axios.post(`${NIM_API_BASE}/chat/completions`, nimRequest, {
      headers: {
        'Authorization': `Bearer ${NIM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      responseType: stream ? 'stream' : 'json'
    });
    
    // Standard stream piping (no reasoning interception)
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      response.data.pipe(res);
    } else {
      res.json(response.data);
    }
    
  } catch (error) {
    console.error('Proxy error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal error' });
  }
});

app.all('*', (req, res) => res.status(404).json({ error: 'Not found' }));
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
