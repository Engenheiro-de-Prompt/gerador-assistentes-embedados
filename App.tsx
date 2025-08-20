
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AssistantPage from './pages/AssistantPage';
import ChatPage from './pages/ChatPage';
import Header from './components/Header';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
        <Routes>
          <Route path="/" element={<><Header /><HomePage /></>} />
          <Route path="/assistant/:id" element={<><Header /><AssistantPage /></>} />
          <Route path="/chat/:id" element={<ChatPage />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
