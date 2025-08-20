
import React from 'react';
import { Link } from 'react-router-dom';
import { AssistantConfig } from '../types';

interface AssistantListProps {
  assistants: AssistantConfig[];
}

const AssistantList: React.FC<AssistantListProps> = ({ assistants }) => {
  if (assistants.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-lg mt-12">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">Your Assistants</h2>
      <div className="space-y-3">
        {assistants.map((assistant) => (
          <Link
            key={assistant.id}
            to={`/assistant/${assistant.id}`}
            className="block bg-gray-800 hover:bg-gray-700 p-4 rounded-lg shadow-md transition-all duration-200 border border-gray-700 hover:border-cyan-500"
          >
            <h3 className="font-bold text-lg text-cyan-400">{assistant.name}</h3>
            <p className="text-sm text-gray-400 mt-1 truncate">{assistant.description}</p>
            <p className="text-xs text-gray-500 mt-2">ID: {assistant.assistantId}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AssistantList;
