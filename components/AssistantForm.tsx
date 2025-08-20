
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssistantConfig } from '../types';
import { createOrRegisterAssistant } from '../services/backendService';

interface AssistantFormProps {
  onAddAssistant: (assistant: AssistantConfig) => void;
}

const AssistantForm: React.FC<AssistantFormProps> = ({ onAddAssistant }) => {
  const [formType, setFormType] = useState<'existing' | 'new'>('existing');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [openAIApiKey, setOpenAIApiKey] = useState('');
  const [assistantId, setAssistantId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      let payload: any = { apiKey: openAIApiKey };
      if (formType === 'new') {
        if (!name || !description || !openAIApiKey) {
          throw new Error('Name, description, and API Key are required for a new assistant.');
        }
        payload.name = name;
        payload.description = description;
      } else {
        if (!assistantId || !openAIApiKey) {
          throw new Error('Assistant ID and API Key are required for an existing assistant.');
        }
        payload.assistantId = assistantId;
      }

      const saved = await createOrRegisterAssistant(payload);
      const newConfig: AssistantConfig = {
        id: saved.id,
        name: saved.name || name || `Assistant ${saved.assistantId.slice(0,6)}`,
        description: saved.description || description || 'An existing OpenAI Assistant',
        assistantId: saved.assistantId,
      };
      onAddAssistant(newConfig);
      navigate(`/assistant/${newConfig.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const commonApiKeyInput = (
     <div className="mb-4">
        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-1">OpenAI API Key</label>
        <input
            id="apiKey"
            type="password"
            value={openAIApiKey}
            onChange={(e) => setOpenAIApiKey(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="sk-..."
            required
        />
    </div>
  )

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
      <div className="flex border-b border-gray-700 mb-4">
        <button
          onClick={() => setFormType('existing')}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${formType === 'existing' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
        >
          Use Existing Assistant
        </button>
        <button
          onClick={() => setFormType('new')}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${formType === 'new' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
        >
          Create New Assistant
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-2 rounded-md mb-4 text-sm">{error}</div>}

        {formType === 'existing' ? (
          <>
            {commonApiKeyInput}
            <div className="mb-4">
              <label htmlFor="assistantId" className="block text-sm font-medium text-gray-300 mb-1">Assistant ID</label>
              <input
                id="assistantId"
                type="text"
                value={assistantId}
                onChange={(e) => setAssistantId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="asst_..."
                required
              />
            </div>
          </>
        ) : (
          <>
            {commonApiKeyInput}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="e.g., Math Tutor"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Instructions</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="You are a personal math tutor. Write and run code to answer math questions."
                required
              />
            </div>
          </>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          {isLoading ? 'Processing...' : 'Generate & Save'}
        </button>
      </form>
    </div>
  );
};

export default AssistantForm;
