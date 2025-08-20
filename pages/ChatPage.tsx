
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChatWidget from '../components/ChatWidget';
import { fetchAssistant } from '../services/backendService';

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [exists, setExists] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAssistant(id).catch(() => setExists(false));
    }
  }, [id]);

  if (!exists || !id) {
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
      <ChatWidget assistantId={id} />
    </div>
  );
};

export default ChatPage;
