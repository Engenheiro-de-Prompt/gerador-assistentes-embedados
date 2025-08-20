
export interface AssistantConfig {
  id: string;
  name: string;
  description: string;
  assistantId: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
