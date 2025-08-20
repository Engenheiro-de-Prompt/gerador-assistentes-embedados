import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'assistants.json');


function loadAssistants() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveAssistants(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Create or register assistant
app.post('/api/assistants', async (req, res) => {
  const { apiKey, name, description, assistantId } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'apiKey is required' });

  let assistants = loadAssistants();
  let finalAssistantId = assistantId;
  let finalName = name;
  let finalDescription = description;

  try {
    if (!assistantId) {
      if (!name || !description)
        return res.status(400).json({ error: 'name and description are required when creating a new assistant' });
      const response = await fetch('https://api.openai.com/v1/assistants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          instructions: description,
          name,
          tools: [{ type: 'file_search' }],
          model: 'gpt-4o'
        })
      });
      if (!response.ok) {
        const err = await response.text();
        return res.status(500).json({ error: err });
      }
      const data = await response.json();
      finalAssistantId = data.id;
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  const id = uuidv4();
  assistants[id] = { id, apiKey, assistantId: finalAssistantId, name: finalName || '', description: finalDescription || '' };
  saveAssistants(assistants);

  const chatUrl = `${req.protocol}://${req.get('host')}/#/chat/${id}`;
  const embedCode = `<iframe src="${chatUrl}" width="400" height="500" style="border:none; position:fixed; bottom:20px; right:20px; z-index:9999;" allow="clipboard-write"></iframe>`;
  res.json({ id, assistantId: finalAssistantId, name: finalName, description: finalDescription, chatUrl, embedCode });
});

// Fetch assistant metadata
app.get('/api/assistants/:id', (req, res) => {
  const assistants = loadAssistants();
  const config = assistants[req.params.id];
  if (!config) return res.status(404).json({ error: 'Not found' });
  res.json({ id: config.id, assistantId: config.assistantId, name: config.name, description: config.description });
});

// Create thread
app.post('/api/assistants/:id/threads', async (req, res) => {
  const assistants = loadAssistants();
  const config = assistants[req.params.id];
  if (!config) return res.status(404).json({ error: 'Assistant not found' });
  try {
    const response = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });
    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Send message and run
app.post('/api/assistants/:id/messages', async (req, res) => {
  const { threadId, content } = req.body;
  const assistants = loadAssistants();
  const config = assistants[req.params.id];
  if (!config) return res.status(404).json({ error: 'Assistant not found' });
  if (!threadId || !content) return res.status(400).json({ error: 'threadId and content required' });
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
    'OpenAI-Beta': 'assistants=v2'
  };
  try {
    let response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ role: 'user', content })
    });
    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }
    response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ assistant_id: config.assistantId })
    });
    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }
    const run = await response.json();
    let runStatus = run;
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      await new Promise(r => setTimeout(r, 1500));
      const statusResp = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${run.id}`, { headers });
      runStatus = await statusResp.json();
    }
    if (runStatus.status !== 'completed') {
      return res.status(500).json({ error: `Run ${runStatus.status}` });
    }
    const messagesResp = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, { headers });
    const messagesData = await messagesResp.json();
    const assistantResponses = messagesData.data
      .filter(msg => msg.run_id === run.id && msg.role === 'assistant')
      .map(msg => msg.content[0].type === 'text' ? msg.content[0].text.value : '');
    res.json({ messages: assistantResponses });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Serve static files after build

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
