"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  Send, 
  Plus, 
  ShieldCheck, 
  RefreshCw, 
  ExternalLink, 
  FileText, 
  Sparkles,
  AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";

const PROMPT_SUGGESTIONS = [
  "Explain P/E ratio in simple language with an example.",
  "What is the difference between a market order and a limit order?",
  "How does portfolio diversification reduce unsystematic risk?",
  "What is Value at Risk (VaR) and how should I use it?",
  "Why did stock prices move after the latest quarterly earnings?"
];

export default function AssistantPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    try {
      const convs = await api.getAIConversations();
      setConversations(convs);
      if (convs.length > 0 && !activeConvId) {
        selectConversation(convs[0].id);
      } else if (convs.length === 0) {
        startNewConversation();
      }
    } catch {
      // fallback
    }
  };

  const selectConversation = async (id: number) => {
    setActiveConvId(id);
    try {
      const data = await api.getAIConversationHistory(id);
      setMessages(data.messages || []);
    } catch {
      // fallback
    }
  };

  const startNewConversation = async () => {
    try {
      const res = await api.createAIConversation({ title: "New Market Query" });
      setActiveConvId(res.id);
      loadConversations();
      selectConversation(res.id);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeConvId || loading) return;

    // Optimistic user message
    const tempUserMsg = {
      id: Date.now(),
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInputText("");
    setLoading(true);

    try {
      const assistantMsg = await api.sendAIMessage(activeConvId, { content: text });
      setMessages((prev) => [...prev, assistantMsg]);
      loadConversations();
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          content: `Error: ${err.message || "Could not retrieve AI response."}`,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] min-h-[550px] flex flex-col md:flex-row bg-[#080B12] rounded-xl border border-slate-800 overflow-hidden">
      {/* Sidebar - Conversation History */}
      <div className="w-full md:w-64 bg-[#0B0F19] border-r border-slate-800 flex flex-col">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-200">Query History</span>
          <button
            onClick={startNewConversation}
            className="p-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs flex items-center space-x-1 transition-colors shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-850 p-2 space-y-1">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => selectConversation(c.id)}
              className={`w-full text-left p-2 rounded text-xs font-mono truncate transition-colors ${
                activeConvId === c.id
                  ? "bg-slate-800 text-blue-400 border border-blue-500/30 font-medium"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>

        {/* Safety indicator */}
        <div className="p-3 border-t border-slate-850 text-[10px] font-mono text-slate-500 space-y-1">
          <div className="flex items-center space-x-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Grounded RAG Guardrails Active</span>
          </div>
          <div>No fabricated prices. Facts cited.</div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#080B12]">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-4 text-xs font-mono text-slate-400">
              <Bot className="w-10 h-10 text-blue-400 opacity-60" />
              <div>
                <span className="font-bold text-slate-200 block text-sm">FinPilot AI Market Copilot</span>
                <span>Select a query suggestion or type below to evaluate financial ratios, market mechanics, or stock trends.</span>
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex items-start space-x-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-3 text-xs leading-relaxed font-mono ${
                    isUser
                      ? "bg-blue-600 text-white"
                      : "bg-[#0F172A] border border-slate-800 text-slate-200"
                  }`}>
                    <div className="whitespace-pre-wrap">{m.content}</div>

                    {/* Citations Box */}
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
                        <span className="font-semibold text-slate-300 block">Verified Data Citations:</span>
                        {m.citations.map((c: any, i: number) => (
                          <div key={i} className="flex items-center space-x-1.5 text-blue-400/90">
                            <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                            <span>{c.title} ({c.source})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 pl-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>Analyzing market data & retrieving citations...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        <div className="px-4 py-2 border-t border-slate-850 flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          {PROMPT_SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(s)}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-slate-200 whitespace-nowrap transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-[#0B0F19]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about a financial ratio, company fundamental, or trade risk..."
              className="flex-1 bg-[#080B12] border border-slate-800 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="p-2 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
