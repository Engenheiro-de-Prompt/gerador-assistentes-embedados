
import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { AssistantConfig } from '../types';
import CodeSnippet from '../components/CodeSnippet';
import { fetchAssistant } from '../services/backendService';

const AssistantPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [assistant, setAssistant] = useState<AssistantConfig | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAssistant(id)
        .then(setAssistant)
        .catch(() => setNotFound(true));
    }
  }, [id]);

  if (notFound) {
    return <Navigate to="/" />;
  }

  if (!assistant) {
    return (
      <main className="container mx-auto px-6 py-12 text-white">Loading...</main>
    );
  }

  const chatUrl = `${window.location.origin}/#/chat/${assistant.id}`;
  const embedCode = `<iframe
  src="${chatUrl}"
  width="400"
  height="500"
  style="border:none; position:fixed; bottom:20px; right:20px; z-index:9999;"
  allow="clipboard-write"
></iframe>`;

  return (
    <main className="container mx-auto px-6 py-12">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
        <div className="mb-8">
            <Link to="/" className="text-cyan-400 hover:text-cyan-300">&larr; Back to all assistants</Link>
            <h1 className="text-4xl font-bold mt-4">{assistant.name}</h1>
            <p className="text-gray-400 mt-2">{assistant.description}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-3">Embed Code</h2>
                    <p className="text-gray-400 mb-3 text-sm">Copy and paste this snippet into your website's HTML where you want the chat widget to appear.</p>
                    <CodeSnippet code={embedCode} />
                </div>
                
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-3">Direct Chat URL</h2>
                    <p className="text-gray-400 mb-3 text-sm">Use this link to access the chatbot directly in a full page.</p>
                    <div className="bg-gray-900 p-3 rounded-md border border-gray-700">
                        <a href={chatUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 break-all hover:underline">{chatUrl}</a>
                    </div>
                </div>
            </div>
            
            <div>
                <h2 className="text-2xl font-semibold mb-3">Live Preview</h2>
                <div className="relative w-full h-[600px] bg-gray-700 rounded-lg overflow-hidden border-4 border-gray-600">
                    <iframe
                        src={chatUrl}
                        title="Chat Preview"
                        className="w-full h-full"
                    ></iframe>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
};

export default AssistantPage;
