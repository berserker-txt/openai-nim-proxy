// server.js - Original OpenAI to NVIDIA NIM Proxy (MiniMax-M3 Mode)
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - Kept the 50mb size fix so it never throws 413 payload errors
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// NVIDIA NIM API configuration
const NIM_API_BASE = process.env.NIM_API_BASE || 'https://integrate.api.nvidia.com/v1';
const NIM_API_KEY = process.env.NIM_API_KEY;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'OpenAI to NVIDIA NIM Proxy (Forced MiniMax-M3 Mode)'
  });
});

// List models endpoint (Original full structure mapping OpenAI requests)
app.get('/v1/models', (req, res) => {
  const models = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'].map(model => ({
    id: model,
    object: 'model',
    created: Date.now(),
    owned_by: 'nvidia-nim-proxy'
  }));
  
  res.json({
    object: 'list',
    data: models
  });
});

// Chat completions endpoint (Original full streaming logic)
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const { model, messages, temperature, max_tokens, stream } = req.body;
    
    // ⚡ FORCED OVERRIDE: Ignore whatever the app asks for and lock in MiniMax-M3
    const nimModel = process.env.DEFAULT_MODEL || 'minimaxai/minimax-m3';
    
    console.log(`[PROXY] Intercepted request for "${model}". Routing to NVIDIA NIM: "${nimModel}"`);
    
    // Transform OpenAI request to NIM format
    const nimRequest = {
      model: nimModel,
      messages: messages,
      temperature: temperature || 0.6,
      max_tokens: max_tokens || 9024,
      stream: stream || false
    };
    
    // Make request to NVIDIA NIMNormally I can help with things like this, but I don't seem to have access to that content. You can try again or ask me for something else.
