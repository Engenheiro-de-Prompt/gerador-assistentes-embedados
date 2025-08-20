
import React from 'react';
import { useParams } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import { AssistantConfig } from '../types';
import ChatWidget from '../components/ChatWidget';

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [assistants] = useLocalStorage<AssistantConfig[]>('assistants', []);
  
  const assistant = assistants.find(a => a.id === id);

  if (!assistant) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <div className="text-center p-4 bg-gray-800 rounded-lg">
                <h1 className="text-xl font-bold text-red-500">Error</h1>
                <p className="text-gray-300">Assistant configuration not found.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full h-screen bg-transparent">
        <ChatWidget apiKey={assistant.openAIApiKey} assistantId={assistant.assistantId} />
    </div>
  );
};

export default ChatPage;
