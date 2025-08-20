const API_BASE_URL = '/api';

export const createOrRegisterAssistant = async (data: {
  apiKey: string;
  name?: string;
  description?: string;
  assistantId?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/assistants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to save assistant');
  }
  return response.json();
};

export const fetchAssistant = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/assistants/${id}`);
  if (!response.ok) throw new Error('Assistant not found');
  return response.json();
};

export const createThread = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/assistants/${id}/threads`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to create thread');
  return response.json();
};

export const sendMessage = async (id: string, threadId: string, content: string) => {
  const response = await fetch(`${API_BASE_URL}/assistants/${id}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ threadId, content }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Chat request failed');
  }
  return response.json();
};
