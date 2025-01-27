'use client';

import Image from "next/image";
import { useChat, Message } from 'ai/react';
import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';

type SandboxResult = {
  sandboxId: string;
  url: string;
}

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [sandboxResult, setSandboxResult] = useState<SandboxResult | null>(null);

  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('preview');
  const [activeCode, setActiveCode] = useState<string>('');
  const [loadingWebpage, setLoadingWebpage] = useState<boolean>(false);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: [
      {
        role: 'system',
        content: `You are an intelligent programming assistant that will help your user create intelligent applications using Streamlit. The code that you generate will be automatically run in the form of a Streamlit application. Keep iterating over the code that you generated previously according to the user feedback. You should be designing effective AI powered applications. To do so, you may need to use the OpenAI API, which allows you to integrate LLMs into the system. The API key is already loaded in as an environment variable, so don't worry about that. 
Here is an overview of the using the OpenAI API to create LLM-powered outputs:
\`\`\`python
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
    messages=[{
        "role": "user",
        "content": "Say this is a test",
    }],
    model="gpt-4o-mini", # gpt-4o-mini for small, fast and simple computations. Otherwise, use gpt-4o
)
response_text = response.choices[0].message.content
\`\`\`

There's also a JSON mode for getting JSON formatted outputs. 
\`\`\`python
import json
response = client.chat.completions.create(
    messages=[{
        "role": "user",
        "content": "Output whether the given text is a noun or a verb in JSON format, for example: {"word_type": "noun|verb"}. The text is: "The cat"."",
    }],
    response_format={
        "type": "json",
    }])
response_json = json.loads(response.choices[0].message.content)
print("Word type: ", response_json["word_type"]).
\`\`\`

Make sure you rewrite the code each time. 
        `,
        id: '0'
      }
    ],
    onFinish: (message: Message) => {
      if (message.role == 'assistant'){
        const code = extractCodeFromMarkdown(message.content);
        setActiveCode(code);
        fetch('/api/sandbox', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'

          },
          body: JSON.stringify({ 
            code, 
            sandboxId: sandboxResult ? sandboxResult.sandboxId : null
          })
        })
        .then(res => res.json())
        .then((data: SandboxResult) => {
          loadPageIntoIframe(data);
        })
        .catch(err => {
          setError(err.message);
        });
      }
      console.log('Message:', message);
    },
    onError: (error: Error) => {
      toast(error.message, { type: 'error' });
      console.error(error);
    }
  });

  let loadPageIntoIframe = async (data: SandboxResult, dontWait?: boolean) => {
    setLoadingWebpage(true);
    if(!dontWait){
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    setSandboxResult(data);
    setLoadingWebpage(false);

    // try {
    //   const response = await fetch(data.url, {
    //     method: 'HEAD',
    //   });
    //   if(response.ok){
    //     console.log("Successfully loaded the webpage in the main try loop.");
    //     setLoadingWebpage(false);
    //     setSandboxResult(data);
    //   } else {
    //     console.log("Failed to load the webpage in the main try loop: ", response);
    //     throw new Error('Failed to load the webpage.');
    //   }
    // } catch (error) {
    //   await new Promise(resolve => setTimeout(resolve, 2000));
    //   console.log("Finished waiting for the sandbox to load.");
    //   await loadPageIntoIframe(data);
    // }
  }

  let extractCodeFromMarkdown = (message: string): string => {
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
    const matches = message.match(codeBlockRegex);
    if (matches && matches.length > 0) {
      return matches[0].replace(/```[\w]*\n|```/g, '').trim();
    }
    return '';
  }

  return (
    <div className="flex w-full h-screen bg-gray-900 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col w-1/2 p-6">
      <div className="flex-grow overflow-y-auto space-y-4 mb-4">
        {messages.slice(1).map(m => (
          <div 
            key={m.id} 
            className={`p-4 rounded-lg shadow-lg bg-gray-800 text-gray-100 ${
              m.role === 'user' 
                ? 'border-blue-600 border-2' 
                : 'border-gray-600 border-2'
            }`}
          >
            <div className="font-bold mb-1">
              {m.role === 'user' ? 'You' : 'AI'}
            </div>
            <div className="whitespace-pre-wrap">
              <ReactMarkdown>{m.content}</ReactMarkdown>
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
        <div className="flex justify-center space-x-4 p-4">
          {sandboxResult && 
            <button 
            onClick={() => loadPageIntoIframe(sandboxResult, true)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>}
        </div>
        <div className="p-4">
          {activeTab === 'code' ? (
            <div className="text-white flex justify-center items-center h-full">
              {!activeCode && <p>Code not loaded.</p>}
              <pre>{activeCode}</pre>
            </div>
          ) : (
        <div className="text-white flex justify-center items-center h-full">

          {sandboxResult &&
            <div className="flex-col">
                <iframe 
                src={sandboxResult?.url} 
                type="text/html"
                className="w-full h-[calc(100vh-10rem)]"
                loading="lazy"
                ></iframe>
                <div className="p-2 bg-gray-900 text-white text-sm">
                  <a 
                    href={sandboxResult.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Pulling from {sandboxResult.url}
                  </a>
                </div>
            </div>
          }
          {!sandboxResult && (
            <p>{loadingWebpage ? 'Loading...' : 'URL not loaded'}</p>
          )}
        </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
