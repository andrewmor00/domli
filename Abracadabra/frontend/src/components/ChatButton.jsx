import React, { useState } from 'react';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import AIChat from './AIChat';

const ChatButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleChat = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsChatOpen(!isChatOpen);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
          
          {/* Main button */}
          <button
            onClick={toggleChat}
            className={`relative w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:shadow-xl hover:scale-110 ${
              isAnimating ? 'scale-95' : ''
            }`}
            aria-label={isChatOpen ? 'Закрыть чат' : 'Открыть AI чат'}
          >
            <div className={`transition-all duration-300 ${isChatOpen ? 'rotate-180' : 'rotate-0'}`}>
              {isChatOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <MessageCircle className="w-6 h-6" />
              )}
            </div>
          </button>

          {/* Notification badge */}
          {!isChatOpen && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          )}

          {/* Tooltip */}
          {!isChatOpen && (
            <div className="absolute bottom-full right-0 mb-2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
                Задайте вопрос AI помощнику
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Component */}
      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default ChatButton; 