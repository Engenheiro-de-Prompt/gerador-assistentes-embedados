
import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { AssistantConfig } from '../types';
import AssistantForm from '../components/AssistantForm';
import AssistantList from '../components/AssistantList';

const HomePage: React.FC = () => {
  const [assistants, setAssistants] = useLocalStorage<AssistantConfig[]>('assistants', []);

  const handleAddAssistant = (assistant: AssistantConfig) => {
    setAssistants([...assistants, assistant]);
  };

  return (
    <main className="container mx-auto px-6 py-12 flex flex-col items-center">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">Create Your AI Assistant</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
          Instantly generate and embed a powerful OpenAI-powered chatbot on any website.
          No backend coding required.
        </p>
      </div>
      <AssistantForm onAddAssistant={handleAddAssistant} />
      <AssistantList assistants={assistants} />
    </main>
  );
};

export default HomePage;
