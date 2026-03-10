"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Zap,
  CheckCircle2,
  Loader,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsAgentThinking(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        assistantMessage += chunk;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: assistantMessage,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
      setIsAgentThinking(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
          {/* Header with Status */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center shadow-md relative">
            {isAgentThinking && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-white to-transparent animate-pulse"></div>
            )}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm ${
                isAgentThinking 
                  ? 'bg-green-400/20 animate-pulse' 
                  : 'bg-white/20'
              }`}>
                <Zap size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">ZenCart AI Agent</h3>
                <p className="text-xs text-blue-100 opacity-90">
                  {isAgentThinking ? 'Executing tasks...' : 'Smart Shopping Assistant'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 h-96 overflow-y-auto bg-gray-50/50 flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 my-auto flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                  <Zap size={20} />
                </div>
                <p className="text-sm font-medium text-gray-700">Welcome to ZenCart AI Agent</p>
                <p className="text-xs text-gray-400 max-w-56 leading-relaxed">
                  I can search products, make recommendations, track orders, compare items, and execute shopping tasks for you.
                </p>
                <div className="mt-3 text-xs text-gray-500 space-y-1">
                  <p className="font-semibold text-gray-600">Try asking:</p>
                  <p>&quot;Find me blue shoes&quot;</p>
                  <p>&quot;Show men&apos;s accessories&quot;</p>
                  <p>&quot;Track my last order&quot;</p>
                </div>
              </div>
            )}
            
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col max-w-[85%] ${
                  m.role === "user" ? "self-end" : "self-start"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl text-sm shadow-sm ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <span className="whitespace-pre-wrap leading-relaxed">
                    {m.content}
                  </span>
                  
                  {/* Tool invocations rendering */}
                  {m.role === "assistant" && (
                    <div className="mt-2 text-xs bg-blue-50 p-2 rounded border border-blue-200 text-blue-700 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>Agent response</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="self-start bg-white border border-gray-100 text-gray-800 p-3 rounded-2xl rounded-bl-none shadow-sm text-sm flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center"
          >
            <input
              className="flex-1 p-2.5 px-4 bg-gray-50 focus:bg-white text-sm border-0 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 rounded-full outline-none transition-all"
              value={input}
              placeholder="Ask me anything..."
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              {isLoading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button with AI Agent Badge */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="relative bg-linear-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-110 hover:shadow-xl text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-600/30 group"
        >
          <Zap size={24} className="group-hover:rotate-12 transition-transform" />
          {messages.length > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse border-2 border-white">
              {Math.min(messages.length, 9)}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
