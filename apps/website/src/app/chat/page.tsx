"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send, Settings, Key, Trash2, Loader2, User, Home, Sparkles,
  AlertCircle, Check, ExternalLink, MessageSquare, Plus, Menu, X,
} from "lucide-react";

type Provider = "anthropic" | "openai" | "groq" | "gemini" | "openrouter" | "deepseek" | "together";

const PROVIDERS: { id: Provider; name: string; icon: string; signup: string; defaultModel: string; free?: boolean }[] = [
  { id: "anthropic", name: "Anthropic Claude", icon: "🟣", signup: "https://console.anthropic.com", defaultModel: "claude-opus-4-5" },
  { id: "openai", name: "OpenAI", icon: "🟢", signup: "https://platform.openai.com", defaultModel: "gpt-4o" },
  { id: "groq", name: "Groq (FREE + Fast)", icon: "⚡", signup: "https://console.groq.com", defaultModel: "llama-3.3-70b-versatile", free: true },
  { id: "gemini", name: "Google Gemini (FREE)", icon: "🔵", signup: "https://aistudio.google.com", defaultModel: "gemini-1.5-pro", free: true },
  { id: "deepseek", name: "DeepSeek (Cheap)", icon: "🟡", signup: "https://platform.deepseek.com", defaultModel: "deepseek-chat" },
  { id: "openrouter", name: "OpenRouter (200+ models)", icon: "🌐", signup: "https://openrouter.ai", defaultModel: "anthropic/claude-3.5-sonnet" },
  { id: "together", name: "Together AI", icon: "🟠", signup: "https://together.ai", defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo" },
];

const AGENTS = [
  { mode: "auto", icon: "🛸", name: "Auto", prompt: "You are Open Talons, a multi-capability AI agent. Help with anything." },
  { mode: "bagsfm", icon: "🎒", name: "Bags.fm", prompt: "🎒 Bags.fm Solana memecoin specialist. Discuss creator fee tokens, signals, risks. Always warn about high risk." },
  { mode: "pumpfun", icon: "🚀", name: "Pump.fun", prompt: "🚀 Pump.fun bonding curve memecoin expert. Discuss new launches, Raydium graduations. ⚠️ High risk." },
  { mode: "solana", icon: "☀️", name: "Solana", prompt: "☀️ Solana ecosystem expert: Jupiter, Raydium, Orca, LSTs, Drift, Kamino, Helius, MEV, priority fees." },
  { mode: "crypto", icon: "📈", name: "Crypto", prompt: "📈 Crypto market analyst. Prices, TA, sentiment, F&G. ⚠️ Not financial advice." },
  { mode: "trading", icon: "📊", name: "Trading", prompt: "📊 Perp DEX expert (Hyperliquid, Lighter). Funding rates, OI, L/S. ⚠️ Risk management first." },
  { mode: "security", icon: "🛡", name: "Security", prompt: "🛡 Token security expert. Rug risks, honeypots, approvals. Recommend GoPlus, RugCheck." },
  { mode: "research", icon: "🔍", name: "Research", prompt: "🔍 Research analyst. Cross-reference sources, fact-check, find primary sources." },
  { mode: "defi", icon: "🏦", name: "DeFi", prompt: "🏦 DeFi expert. TVL, yields, stablecoins, IL, strategies." },
  { mode: "code", icon: "🔬", name: "Code", prompt: "🔬 Code helper. Python, JS, TS. Explain clearly, handle errors." },
  { mode: "imagegen", icon: "🎨", name: "Image", prompt: "🎨 Image generation expert. Help craft prompts for DALL-E, Stable Diffusion, FLUX." },
];

interface Message {
  role: "user" | "assistant";
  content: string;
  ts?: number;
}

interface Conversation {
  id: string;
  title: string;
  agent: string;
  messages: Message[];
  updatedAt: number;
}

export default function ChatPage() {
  const [provider, setProvider] = useState<Provider>("groq");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [agent, setAgent] = useState(AGENTS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load from localStorage
  useEffect(() => {
    const savedProvider = localStorage.getItem("ot_provider") as Provider | null;
    const savedKey = localStorage.getItem("ot_apikey");
    const savedModel = localStorage.getItem("ot_model");
    const savedConvs = localStorage.getItem("ot_conversations");
    if (savedProvider) setProvider(savedProvider);
    if (savedKey) setApiKey(savedKey);
    if (savedModel) setModel(savedModel);
    if (savedConvs) {
      try { setConversations(JSON.parse(savedConvs)); } catch { /* */ }
    }
    setShowSettings(!savedKey);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  function saveSettings() {
    localStorage.setItem("ot_provider", provider);
    localStorage.setItem("ot_apikey", apiKey);
    localStorage.setItem("ot_model", model);
    setShowSettings(false);
    setError("");
  }

  function newConversation() {
    if (messages.length > 0 && currentConvId) saveCurrentConversation();
    setMessages([]);
    setCurrentConvId(null);
    setError("");
  }

  function saveCurrentConversation() {
    if (messages.length === 0) return;
    const id = currentConvId || `conv_${Date.now()}`;
    const title = messages[0]?.content.slice(0, 50) || "Untitled";
    const conv: Conversation = {
      id, title, agent: agent.mode, messages, updatedAt: Date.now(),
    };
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      const next = [conv, ...filtered].slice(0, 50);
      localStorage.setItem("ot_conversations", JSON.stringify(next));
      return next;
    });
    setCurrentConvId(id);
  }

  function loadConversation(conv: Conversation) {
    if (messages.length > 0 && currentConvId) saveCurrentConversation();
    setMessages(conv.messages);
    const a = AGENTS.find((x) => x.mode === conv.agent) || AGENTS[0];
    setAgent(a);
    setCurrentConvId(conv.id);
    setSidebarOpen(false);
  }

  function deleteConversation(id: string) {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      localStorage.setItem("ot_conversations", JSON.stringify(next));
      return next;
    });
    if (currentConvId === id) {
      setMessages([]);
      setCurrentConvId(null);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading || streaming) return;
    if (!apiKey) {
      setShowSettings(true);
      setError("API key required");
      return;
    }

    const userMsg: Message = { role: "user", content: input.trim(), ts: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setError("");
    setStreaming(true);
    setStreamText("");

    abortRef.current = new AbortController();

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          provider, apiKey, model: model || undefined,
          systemPrompt: agent.prompt,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        }),
      });

      if (!r.ok) {
        const errData = await r.json().catch(() => ({ error: "Unknown error" }));
        setError(errData.error || "Request failed");
        setStreaming(false);
        return;
      }

      if (!r.body) {
        setError("No response body");
        setStreaming(false);
        return;
      }

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "text") {
              accumulated += event.text;
              setStreamText(accumulated);
            } else if (event.type === "error") {
              setError(event.error);
            } else if (event.type === "done") {
              // finalize
            }
          } catch { /* skip */ }
        }
      }

      // Finalize
      if (accumulated) {
        const assistantMsg: Message = { role: "assistant", content: accumulated, ts: Date.now() };
        const finalMessages = [...newMessages, assistantMsg];
        setMessages(finalMessages);
        setStreamText("");
        // Auto-save
        setTimeout(() => {
          const id = currentConvId || `conv_${Date.now()}`;
          const title = finalMessages[0]?.content.slice(0, 50) || "Untitled";
          const conv: Conversation = { id, title, agent: agent.mode, messages: finalMessages, updatedAt: Date.now() };
          setConversations((prev) => {
            const filtered = prev.filter((c) => c.id !== id);
            const next = [conv, ...filtered].slice(0, 50);
            localStorage.setItem("ot_conversations", JSON.stringify(next));
            return next;
          });
          setCurrentConvId(id);
        }, 100);
      }
    } catch (e: any) {
      if (e.name !== "AbortError") setError(e.message);
    } finally {
      setStreaming(false);
      setLoading(false);
    }
  }

  function stopStreaming() {
    abortRef.current?.abort();
    if (streamText) {
      setMessages((prev) => [...prev, { role: "assistant", content: streamText + " [stopped]", ts: Date.now() }]);
    }
    setStreamText("");
    setStreaming(false);
  }

  function clearChat() {
    setMessages([]);
    setError("");
    setCurrentConvId(null);
  }

  return (
    <main className="min-h-screen bg-bg text-white flex">
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
           style={{ background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)" }} />

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative md:flex w-72 h-screen bg-panel/80 backdrop-blur border-r border-border z-40 transition-transform flex-col`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl">🦅</span>
            <span className="font-bold gradient-text">Open Talons</span>
          </a>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <button onClick={newConversation}
                className="m-3 px-3 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> New Chat
        </button>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          <div className="text-[10px] uppercase text-gray-600 px-2 mb-2 tracking-wider">History</div>
          {conversations.length === 0 ? (
            <div className="text-xs text-gray-600 px-2 py-4 text-center">No conversations yet</div>
          ) : (
            conversations.map((c) => (
              <div key={c.id}
                   onClick={() => loadConversation(c)}
                   className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition text-sm ${
                     c.id === currentConvId ? "bg-accent/20 text-white" : "hover:bg-bg/50 text-gray-400"
                   }`}>
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                <div className="flex-1 min-w-0 truncate">{c.title}</div>
                <button onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 transition">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-border space-y-2">
          <button onClick={() => setShowSettings(!showSettings)}
                  className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border hover:border-accent text-xs flex items-center gap-2 transition">
            <Settings className="w-3.5 h-3.5" /> Settings
          </button>
          <div className="text-[10px] text-gray-600 text-center">
            v2.3 • <span className="text-accent">{provider}</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-bg/80 border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1">
                <Menu className="w-5 h-5" />
              </button>
              <select
                value={agent.mode}
                onChange={(e) => setAgent(AGENTS.find((a) => a.mode === e.target.value) || AGENTS[0])}
                className="bg-panel border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent">
                {AGENTS.map((a) => (
                  <option key={a.mode} value={a.mode}>{a.icon} {a.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={clearChat} title="Clear messages"
                      className="p-2 rounded-lg bg-panel border border-border hover:border-red-500 transition">
                <Trash2 className="w-4 h-4" />
              </button>
              <a href="/" title="Home" className="p-2 rounded-lg bg-panel border border-border hover:border-accent transition">
                <Home className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Settings */}
          {showSettings && (
            <div className="border-t border-border bg-panel/70 backdrop-blur">
              <div className="px-4 py-4 space-y-3">
                <div className="flex items-center gap-2"><Key className="w-4 h-4 text-accent" /><div className="font-semibold text-sm">LLM Configuration</div></div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Provider</label>
                    <select value={provider} onChange={(e) => setProvider(e.target.value as Provider)}
                            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent">
                      {PROVIDERS.map((p) => (
                        <option key={p.id} value={p.id}>{p.icon} {p.name}{p.free ? " (FREE)" : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Model (optional)</label>
                    <input type="text" value={model} onChange={(e) => setModel(e.target.value)}
                           placeholder={PROVIDERS.find((p) => p.id === provider)?.defaultModel}
                           className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center justify-between">
                    <span>API Key</span>
                    <a href={PROVIDERS.find((p) => p.id === provider)?.signup} target="_blank" rel="noreferrer"
                       className="text-accent2 hover:underline flex items-center gap-1 text-xs">
                      Get key <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                         placeholder="sk-... or paste your key"
                         className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent" />
                  <div className="text-[10px] text-gray-500 mt-1">🔒 Stored only in your browser localStorage. Never logged.</div>
                </div>
                <button onClick={saveSettings}
                        className="w-full bg-accent text-white rounded-lg py-2 font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Save & Continue
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {messages.length === 0 && !streaming && !showSettings && (
              <div className="text-center py-16">
                <div className="text-7xl mb-4">{agent.icon}</div>
                <h2 className="text-3xl font-bold mb-2 gradient-text">{agent.name}</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">Ready when you are. Streaming enabled.</p>
                <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {[
                    "What's the current Solana TPS?",
                    "Find trending Bags.fm tokens",
                    "Explain Hyperliquid funding rates",
                    "Compare Claude Opus vs GPT-4o",
                  ].map((s) => (
                    <button key={s} onClick={() => setInput(s)}
                            className="glass rounded-lg p-3 text-left text-sm text-gray-400 hover:text-white transition">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{agent.icon}</span>
                    </div>
                  )}
                  <div className={`max-w-[85%] ${msg.role === "user" ? "bg-accent text-white" : "glass"} rounded-2xl px-4 py-3`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-9 h-9 rounded-lg bg-bg border border-border flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming bubble */}
              {streaming && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                    {streamText ? <span className="text-lg">{agent.icon}</span> : <Loader2 className="w-4 h-4 text-accent animate-spin" />}
                  </div>
                  <div className="max-w-[85%] glass rounded-2xl px-4 py-3">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {streamText || <span className="text-gray-400 italic">Connecting...</span>}
                      {streamText && <span className="inline-block w-2 h-4 ml-1 bg-accent animate-pulse" />}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="glass rounded-xl p-4 border-red-500/40 bg-red-500/5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-300">{error}</div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="sticky bottom-0 backdrop-blur-md bg-bg/80 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="glass rounded-xl p-2 flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={streaming}
                placeholder={streaming ? "Streaming..." : `Message ${agent.name}...  (Shift+Enter for new line)`}
                rows={1}
                className="flex-1 bg-transparent resize-none px-3 py-2 text-sm focus:outline-none placeholder:text-gray-600 disabled:opacity-50"
                style={{ maxHeight: "200px" }}
              />
              {streaming ? (
                <button onClick={stopStreaming}
                        className="bg-red-500 text-white rounded-lg p-2 hover:opacity-90 transition" title="Stop">
                  <X className="w-5 h-5" />
                </button>
              ) : (
                <button onClick={sendMessage} disabled={!input.trim()}
                        className="bg-accent text-white rounded-lg p-2 hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed">
                  <Send className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="text-[10px] text-gray-600 text-center mt-2">
              v2.3 • <span className="text-accent">{provider}</span> {model && `· ${model}`} · 🔒 Your API key stays in your browser · ⚡ Streaming enabled
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
