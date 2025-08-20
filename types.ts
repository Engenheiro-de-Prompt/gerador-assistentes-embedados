
export interface AssistantConfig {
  id: string;
  name: string;
  description: string;
  openAIApiKey: string;
  assistantId: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Types based on OpenAI API responses
export interface OpenAIThreadMessage {
    id: string;
    object: string;
    created_at: number;
    thread_id: string;
    role: 'user' | 'assistant';
    content: {
        type: 'text';
        text: {
            value: string;
            annotations: any[];
        };
    }[];
    assistant_id: string | null;
    run_id: string | null;
    metadata: Record<string, unknown>;
}
