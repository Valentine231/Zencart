"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Zap,
  CheckCircle2,
  Loader,
  MessageCircle,
} from "lucide-react";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, getToolName } from "ai";
import { useUser } from "@clerk/nextjs";
import { useCartStore } from "@/Store/cartStore";
import { useRouter } from "next/navigation";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { user } = useUser();
  const router = useRouter();
  const addToCartAction = useCartStore((state) => state.addToCart);
  
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle Tool Actions
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;

    lastMessage.parts.forEach((part) => {
      if (part.type === "tool-invocation" && part.state === "output-available") {
        try {
          const result = JSON.parse(part.result as string);
          if (result && result.action) {
            console.log("Executing AI Action:", result.action, result);
            
            switch (result.action) {
              case "addToCart":
                if (result.product) {
                  addToCartAction(result.product);
                }
                break;
              case "checkout":
                router.push("/checkout");
                break;
              case "viewCart":
                router.push("/cart");
                break;
              default:
                break;
            }
          }
        } catch (e) {
          // Result might not be JSON
        }
      }
    });
  }, [messages, addToCartAction, router]);

  const isAgentThinking = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
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
                <h3 className="font-semibold text-sm text-black">ZenCart AI Agent</h3>
                <p className="text-xs text-black/80">
                  {isAgentThinking ? 'Executing tasks...' : 'Smart Shopping Assistant'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <a
                href="https://wa.me/2348012345678"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black/80 hover:text-black hover:bg-white/10 p-1.5 rounded-full transition-colors flex items-center gap-1 text-xs font-medium"
                title="Chat on WhatsApp"
              >
                <MessageCircle size={18} />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
              <button
                onClick={toggleChat}
                className="text-black/80 hover:text-black hover:bg-white/10 p-1.5 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 min-h-[300px] overflow-y-auto bg-gray-50/50 flex flex-col gap-4 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 my-auto flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                  <Zap size={20} />
                </div>
                <p className="text-sm font-medium text-black">Welcome to ZenCart AI Agent</p>
                <p className="text-xs text-gray-600 max-w-56 leading-relaxed">
                  I can search products, make recommendations, track orders, compare items, and execute shopping tasks for you.
                </p>
                <div className="mt-3 text-xs text-gray-500 space-y-1">
                  <p className="font-semibold text-black">Try asking:</p>
                  <p className="text-black">&quot;Find me blue shoes&quot;</p>
                  <p className="text-black">&quot;Show men&apos;s accessories&quot;</p>
                  <p className="text-black">&quot;Track my last order&quot;</p>
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
                      : "bg-white border border-gray-100 text-black rounded-bl-none"
                  }`}
                >
                  <span className="whitespace-pre-wrap leading-relaxed">
                    {m.parts
                      .filter((p) => p.type === "text")
                      .map((p) => (p as { type: "text"; text: string }).text)
                      .join("")}
                  </span>
                  
                  {/* Tool invocations rendering */}
                  {m.parts.some((p) => isToolUIPart(p)) && (
                    <div className="mt-2 text-xs bg-blue-50 p-2 rounded border border-blue-200 text-blue-700 flex flex-col gap-1">
                      {m.parts
                        .filter((p) => isToolUIPart(p))
                        .map((p, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            <span>Used tool: {getToolName(p)}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isAgentThinking && (
              <div className="self-start bg-white border border-gray-100 text-black p-3 rounded-2xl rounded-bl-none shadow-sm text-sm flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            )}
            {error && (
              <div className="self-center bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl shadow-sm text-xs text-center max-w-[90%]">
                <p className="font-semibold mb-1">Connection Error</p>
                <p>I&apos;m having trouble connecting. Please check your internet or try again later.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 underline font-medium hover:text-red-700"
                >
                  Retry
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim()) return;
              sendMessage(
                { text: input },
                { body: { userId: user?.id } }
              );
              setInput("");
            }}
            className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center"
          >
            <input
              id="chat-input"
              name="input"
              className="flex-1 p-2.5 px-4 bg-gray-50 focus:bg-white text-sm border-0 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 rounded-full outline-none transition-all text-black"
              value={input}
              placeholder="Ask me anything..."
              onChange={(e) => setInput(e.target.value)}
              disabled={isAgentThinking}
            />
            <button
              type="submit"
              disabled={isAgentThinking || !input.trim()}
              className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              {isAgentThinking ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
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
