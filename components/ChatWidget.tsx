
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, OpenAIThreadMessage } from '../types';
import { createThread, addMessageToThread, createRun, pollRunStatus, getThreadMessages } from '../services/openaiService';
import { ChatIcon } from './icons/ChatIcon';
import { CloseIcon } from './icons/CloseIcon';
import { SendIcon } from './icons/SendIcon';

interface ChatWidgetProps {
  apiKey: string;
  assistantId: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ apiKey, assistantId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initThread = async () => {
      if (!threadId && apiKey) {
        try {
          const thread = await createThread(apiKey);
          setThreadId(thread.id);
        } catch (error) {
          console.error('Failed to create thread:', error);
          // Optional: add a message to UI about the error
        }
      }
    };
    initThread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !threadId) return;

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      await addMessageToThread(apiKey, threadId, userMessage.content);
      const run = await createRun(apiKey, threadId, assistantId);
      await pollRunStatus(apiKey, threadId, run.id);
      
      const newMessages = await getThreadMessages(apiKey, threadId);
      const assistantResponses = newMessages
        .filter((msg: OpenAIThreadMessage) => msg.run_id === run.id && msg.role === 'assistant')
        .map((msg: OpenAIThreadMessage) => ({
          id: msg.id,
          role: 'assistant' as const,
          content: msg.content[0].type === 'text' ? msg.content[0].text.value : 'Unsupported content type',
        }));
        
      setMessages(prev => [...prev, ...assistantResponses.reverse()]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = { id: `error-${Date.now()}`, role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <div className="w-80 h-[28rem] bg-gray-800 rounded-lg shadow-2xl flex flex-col border border-gray-700">
          <header className="bg-gray-900 p-3 flex justify-between items-center rounded-t-lg">
            <h3 className="text-white font-semibold">Chat Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <CloseIcon />
            </button>
          </header>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-800">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-lg ${message.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                    <p className="text-sm break-words">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-gray-200 px-3 py-2 rounded-lg flex items-center space-x-2">
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
              )}
               <div ref={messagesEndRef} />
            </div>
          </div>
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-700 bg-gray-900 rounded-b-lg">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 bg-gray-700 border-gray-600 rounded-full px-4 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                disabled={isLoading}
              />
              <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 rounded-full p-2 text-white disabled:bg-gray-600" disabled={isLoading}>
                <SendIcon />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-full p-4 shadow-2xl transition-transform transform hover:scale-110"
        >
          <ChatIcon />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
