import React, { useState } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';

const FloatingChatBubble = ({ onOpenChatbot }) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleBubbleClick = () => {
    if (onOpenChatbot) {
      onOpenChatbot();
    }
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Tooltip */}
        {showTooltip && isMinimized && (
          <div className="absolute bottom-16 right-0 mb-2 mr-2">
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
              Need help? Chat with AI Assistant
              <div className="absolute bottom-0 right-4 transform translate-y-full">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        )}

        {/* Main Bubble Button */}
        <button
          onClick={handleBubbleClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="group relative w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          <MessageCircle className="w-6 h-6 mx-auto" />
          
          {/* Pulse Animation */}
          <div className="absolute inset-0 rounded-full bg-blue-400 opacity-75 animate-ping"></div>
          <div className="absolute inset-0 rounded-full bg-blue-500">
            {/* Icon */}
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
            </div>
          </div>
          

          {/* Notification Badge (optional) */}
          {/* <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">!</span>
          </div> */}
        </button>
      </div>
    </>
  );
};

export default FloatingChatBubble;