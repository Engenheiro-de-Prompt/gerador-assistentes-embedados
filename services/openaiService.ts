
import { OpenAIThreadMessage } from '../types';

const API_BASE_URL = 'https://api.openai.com/v1';

const commonHeaders = (apiKey: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`,
  'OpenAI-Beta': 'assistants=v2',
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createAssistant = async (apiKey: string, name: string, instructions: string): Promise<{ id: string }> => {
  const response = await fetch(`${API_BASE_URL}/assistants`, {
    method: 'POST',
    headers: commonHeaders(apiKey),
    body: JSON.stringify({
      instructions: instructions,
      name: name,
      tools: [{ "type": "file_search" }],
      model: "gpt-4o",
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create assistant: ${error.error.message}`);
  }
  return response.json();
};


export const createThread = async (apiKey: string): Promise<{ id: string }> => {
  const response = await fetch(`${API_BASE_URL}/threads`, {
    method: 'POST',
    headers: commonHeaders(apiKey),
  });
  if (!response.ok) throw new Error('Failed to create thread.');
  return response.json();
};

export const addMessageToThread = async (apiKey: string, threadId: string, content: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/threads/${threadId}/messages`, {
    method: 'POST',
    headers: commonHeaders(apiKey),
    body: JSON.stringify({
      role: 'user',
      content: content,
    }),
  });
  if (!response.ok) throw new Error('Failed to add message to thread.');
  return response.json();
};

export const createRun = async (apiKey:string, threadId: string, assistantId: string): Promise<{ id: string }> => {
  const response = await fetch(`${API_BASE_URL}/threads/${threadId}/runs`, {
    method: 'POST',
    headers: commonHeaders(apiKey),
    body: JSON.stringify({
      assistant_id: assistantId,
    }),
  });
  if (!response.ok) throw new Error('Failed to create run.');
  return response.json();
};

export const pollRunStatus = async (apiKey: string, threadId: string, runId: string): Promise<any> => {
    let run;
    let attempts = 0;
    do {
      if (attempts > 0) await sleep(1500);
      const response = await fetch(`${API_BASE_URL}/threads/${threadId}/runs/${runId}`, {
        method: 'GET',
        headers: commonHeaders(apiKey),
      });
      if (!response.ok) throw new Error('Failed to poll run status.');
      run = await response.json();
      attempts++;
    } while (run.status === 'queued' || run.status === 'in_progress');
    
    if (run.status !== 'completed') {
        throw new Error(`Run finished with status: ${run.status}. Reason: ${run.last_error?.message || 'Unknown'}`);
    }

    return run;
};

export const getThreadMessages = async (apiKey: string, threadId: string): Promise<OpenAIThreadMessage[]> => {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}/messages`, {
        method: 'GET',
        headers: commonHeaders(apiKey),
    });
    if (!response.ok) throw new Error('Failed to get thread messages.');
    const data = await response.json();
    return data.data;
};
