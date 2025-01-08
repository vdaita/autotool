'use client';

import Image from "next/image";
import { useChat } from 'ai/react';

type Message = {
  content: string;
  role: string;
}

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  let makeRequest = () => {
    // Send the message to the server and process code
    
  }

  let extractCodeFromMarkdown = (message: string): string => {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const matches = message.match(codeBlockRegex);
    if (matches && matches.length > 0) {
      return matches[0].replace(/```/g, '').trim();
    }
    return '';
  }


  return (
    <div className="flex w-full h-screen bg-gray-900 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col w-1/2 p-6">
      <div className="flex-grow overflow-y-auto space-y-4 mb-4">
        {messages.map(m => (
          <div 
            key={m.id} 
            className={`p-4 rounded-lg shadow-lg bg-gray-800 text-gray-100 ${
              m.role === 'user' 
                ? 'border-blue-600 border-2' 
                : 'border-gray-600 border-2'
            } max-w-[80%]`}
          >
            <div className="font-bold mb-1">
              {m.role === 'user' ? 'You' : 'AI'}
            </div>
            <div className="whitespace-pre-wrap">
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="sticky bottom-0">
        <input
        className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xl"
        value={input}
        placeholder="Type your message..."
        onChange={handleInputChange}
        />
      </form>
      </div>
      <div className="w-1/2 bg-gray-800">
      {/* Right side content will go here */}
      </div>
    </div>
  );
}
