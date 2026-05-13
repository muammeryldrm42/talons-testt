"use client";

import { useState } from "react";
import { Github, Home, Search, Filter, Package, Check, Copy, ExternalLink, Sparkles } from "lucide-react";

interface Plugin {
  name: string;
  fullName: string;
  category: string;
  icon: string;
  description: string;
  tools: number;
  permissions: string[];
  envKeys: string[];
  agentMode?: string;
}

const PLUGINS: Plugin[] = [
  // Crypto-specific
  { name: "bagsfm", fullName: "@open-talons/plugin-bagsfm", category: "crypto", icon: "🎒", description: "Bags.fm Solana memecoin launchpad — creator fee tokens, signal scoring, creator analysis", tools: 5, permissions: ["read", "external"], envKeys: ["HELIUS_API_KEY"], agentMode: "bagsfm" },
  { name: "pumpfun", fullName: "@open-talons/plugin-pumpfun", category: "crypto", icon: "🚀", description: "Pump.fun bonding curve memecoin tracker + Raydium graduation alerts", tools: 3, permissions: ["read", "external"], envKeys: [], agentMode: "pumpfun" },
  { name: "solana", fullName: "@open-talons/plugin-solana", category: "crypto", icon: "☀️", description: "Solana ecosystem — Jupiter, Raydium, Orca, LSTs (mSOL/jitoSOL/INF), Drift, Kamino, Helius DAS", tools: 12, permissions: ["read", "external"], envKeys: ["HELIUS_API_KEY", "BIRDEYE_API_KEY"], agentMode: "solana" },
  { name: "solana-dev", fullName: "@open-talons/plugin-solana-dev", category: "crypto", icon: "🛠", description: "Solana developer tools — Anchor IDL, Token-2022, cNFT, compute units, priority fees, RPC health", tools: 7, permissions: ["read"], envKeys: ["HELIUS_API_KEY"], agentMode: "soldev" },
  { name: "base-meme", fullName: "@open-talons/plugin-base-meme", category: "crypto", icon: "🔷", description: "Base network — Clanker memes, Virtuals AI agents, Aerodrome", tools: 4, permissions: ["read"], envKeys: [], agentMode: "base" },
  { name: "crypto", fullName: "@open-talons/plugin-crypto", category: "crypto", icon: "📈", description: "CoinGecko prices, Binance TA, fear & greed, trending", tools: 6, permissions: ["read"], envKeys: ["COINGECKO_API_KEY"], agentMode: "crypto" },
  { name: "trading", fullName: "@open-talons/plugin-trading", category: "crypto", icon: "📊", description: "Hyperliquid + Lighter perp DEXes (DRY_RUN default)", tools: 6, permissions: ["read", "execute", "trade"], envKeys: ["HL_PRIVATE_KEY", "LIGHTER_PRIVATE_KEY"], agentMode: "trading" },
  { name: "strategies", fullName: "@open-talons/plugin-strategies", category: "crypto", icon: "🧮", description: "Strategy backtesting — EMA cross, RSI, MACD, Bollinger Breakout", tools: 6, permissions: ["read"], envKeys: [], agentMode: "quant" },
  { name: "security", fullName: "@open-talons/plugin-security", category: "crypto", icon: "🛡", description: "Token security — GoPlus, RugCheck (Solana), phishing detection", tools: 4, permissions: ["read"], envKeys: [], agentMode: "security" },
  { name: "defi", fullName: "@open-talons/plugin-defi", category: "crypto", icon: "🏦", description: "DefiLlama — TVL, yields, stablecoins, protocol details", tools: 5, permissions: ["read"], envKeys: [], agentMode: "defi" },
  { name: "onchain", fullName: "@open-talons/plugin-onchain", category: "crypto", icon: "⛓", description: "Multi-chain wallet analysis — ETH, Base, Solana", tools: 5, permissions: ["read"], envKeys: ["ETHERSCAN_API_KEY", "BASESCAN_API_KEY"], agentMode: "onchain" },
  { name: "whale", fullName: "@open-talons/plugin-whale", category: "crypto", icon: "🐋", description: "Whale alerts, smart money tracking (Vitalik, Wintermute, Jump)", tools: 5, permissions: ["read"], envKeys: ["WHALE_ALERT_API_KEY"], agentMode: "whale" },
  { name: "derivatives", fullName: "@open-talons/plugin-derivatives", category: "crypto", icon: "📉", description: "F&G index, liquidations, open interest, L/S ratio, volatility", tools: 6, permissions: ["read"], envKeys: [], agentMode: "derivatives" },
  { name: "memescan", fullName: "@open-talons/plugin-memescan", category: "crypto", icon: "🐸", description: "Multi-chain meme scanner with 0-100 signal scoring", tools: 4, permissions: ["read"], envKeys: [], agentMode: "memescan" },
  { name: "airdrop", fullName: "@open-talons/plugin-airdrop", category: "crypto", icon: "🪂", description: "Airdrop radar + wallet eligibility + NFT floors + funding arb", tools: 10, permissions: ["read"], envKeys: [], agentMode: "airdrop" },
  { name: "nft", fullName: "@open-talons/plugin-nft", category: "crypto", icon: "🎨", description: "NFT floor prices, trending collections", tools: 2, permissions: ["read"], envKeys: ["OPENSEA_API_KEY"], agentMode: "nft" },
  { name: "twitter", fullName: "@open-talons/plugin-twitter", category: "social", icon: "🐦", description: "X/Twitter sentiment, profile analysis, search", tools: 3, permissions: ["external"], envKeys: ["RAPIDAPI_KEY"], agentMode: "twitter" },
  { name: "telegram", fullName: "@open-talons/plugin-telegram", category: "social", icon: "📱", description: "Telegram bot — send messages, alerts, crypto reports", tools: 4, permissions: ["external"], envKeys: ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"], agentMode: "telegram" },
  { name: "github", fullName: "@open-talons/plugin-github", category: "dev", icon: "🐙", description: "GitHub — repos, issues, PRs, profiles, code search", tools: 8, permissions: ["read", "write"], envKeys: ["GITHUB_TOKEN"], agentMode: "github" },
  { name: "research", fullName: "@open-talons/plugin-research", category: "research", icon: "🔍", description: "Web search, fetch, RSS feeds (crypto + tech)", tools: 4, permissions: ["external"], envKeys: ["SERPER_API_KEY"], agentMode: "research" },
  { name: "macro", fullName: "@open-talons/plugin-macro", category: "research", icon: "🔮", description: "Macro — DXY, treasury yields, indices, forex, stocks, RSS news", tools: 6, permissions: ["read"], envKeys: [], agentMode: "macro" },

  // General-purpose
  { name: "filesystem", fullName: "@open-talons/plugin-filesystem", category: "general", icon: "📁", description: "Read, write, edit, list workspace files (permission-gated)", tools: 6, permissions: ["read", "write"], envKeys: [], agentMode: "filesystem" },
  { name: "shell", fullName: "@open-talons/plugin-shell", category: "general", icon: "💻", description: "Permission-gated bash execution (dangerous patterns blocked)", tools: 3, permissions: ["execute"], envKeys: [], agentMode: "shell" },
  { name: "code", fullName: "@open-talons/plugin-code", category: "general", icon: "🔬", description: "Python / JS / TS code execution + pip/npm install", tools: 5, permissions: ["execute"], envKeys: [], agentMode: "code" },
  { name: "browser", fullName: "@open-talons/plugin-browser", category: "general", icon: "🌐", description: "Playwright browser automation — scrape, screenshot, fill forms", tools: 6, permissions: ["external"], envKeys: [], agentMode: "browser" },
  { name: "email", fullName: "@open-talons/plugin-email", category: "general", icon: "📧", description: "Email — SMTP send, Gmail API, IMAP read", tools: 4, permissions: ["external"], envKeys: ["SMTP_HOST", "GMAIL_ACCESS_TOKEN"], agentMode: "email" },
  { name: "database", fullName: "@open-talons/plugin-database", category: "general", icon: "🗃", description: "SQLite, PostgreSQL, MongoDB query tools", tools: 7, permissions: ["read", "execute"], envKeys: ["POSTGRES_URL", "MONGO_URI"], agentMode: "database" },
  { name: "imagegen", fullName: "@open-talons/plugin-imagegen", category: "general", icon: "🎨", description: "Image generation — DALL-E 3, Stable Diffusion, Replicate (FLUX), Together (free)", tools: 5, permissions: ["external"], envKeys: ["OPENAI_API_KEY", "STABILITY_API_KEY", "REPLICATE_API_TOKEN", "TOGETHER_API_KEY"], agentMode: "imagegen" },
  { name: "voice", fullName: "@open-talons/plugin-voice", category: "general", icon: "🔊", description: "TTS (ElevenLabs/OpenAI) + STT (Whisper, Groq free)", tools: 5, permissions: ["external"], envKeys: ["ELEVENLABS_API_KEY", "OPENAI_API_KEY", "GROQ_API_KEY"], agentMode: "voice" },
];

const CATEGORIES = [
  { id: "all", name: "All", color: "from-accent to-accent2" },
  { id: "crypto", name: "💰 Crypto", color: "from-yellow-400 to-orange-500" },
  { id: "general", name: "🛠 General-purpose", color: "from-blue-400 to-cyan-500" },
  { id: "research", name: "🔍 Research", color: "from-green-400 to-emerald-500" },
  { id: "social", name: "💬 Social", color: "from-pink-400 to-purple-500" },
  { id: "dev", name: "👨‍💻 Developer", color: "from-indigo-400 to-violet-500" },
];

export default function PluginsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Plugin | null>(null);
  const [copied, setCopied] = useState("");

  const filtered = PLUGINS.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  }

  return (
    <main className="min-h-screen bg-bg text-white relative">
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
           style={{ background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)" }} />

      {/* Header */}
      <nav className="sticky top-0 z-30 backdrop-blur-md bg-bg/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl">🦅</span>
            <span className="font-bold gradient-text">Open Talons</span>
            <span className="text-xs text-gray-500 ml-2 hidden sm:inline">Plugins Marketplace</span>
          </a>
          <div className="flex items-center gap-2">
            <a href="/chat" className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30 text-accent text-sm hover:bg-accent/20">
              💬 Live Chat
            </a>
            <a href="https://github.com/muammeryldrm42/talonssss" className="p-2 rounded-lg bg-panel border border-border hover:border-accent">
              <Github className="w-4 h-4" />
            </a>
            <a href="/" className="p-2 rounded-lg bg-panel border border-border hover:border-accent">
              <Home className="w-4 h-4" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-black mb-4">
          <span className="gradient-text">{PLUGINS.length}</span> Plugins
        </h1>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          The Open Talons plugin marketplace. Crypto-first, but covers everything.
          Each plugin ships with tools + an agent persona. MIT licensed.
        </p>

        {/* Search */}
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plugins..."
            className="w-full glass rounded-xl px-12 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          {CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      category === cat.id
                        ? "bg-accent text-white"
                        : "bg-panel border border-border text-gray-400 hover:text-white"
                    }`}>
              {cat.name} ({cat.id === "all" ? PLUGINS.length : PLUGINS.filter((p) => p.category === cat.id).length})
            </button>
          ))}
        </div>
      </section>

      {/* Plugin grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No plugins match your search.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((plugin) => (
              <div key={plugin.name} onClick={() => setSelected(plugin)}
                   className="glass rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition group">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{plugin.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white truncate">{plugin.name}</h3>
                      {plugin.agentMode && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent font-mono">@{plugin.agentMode}</span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono truncate">{plugin.fullName}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-4 line-clamp-3 leading-relaxed">{plugin.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500"><Package className="w-3 h-3 inline mr-1" />{plugin.tools} tools</span>
                  </div>
                  <div className="flex gap-1">
                    {plugin.permissions.map((p) => (
                      <span key={p} className={`px-1.5 py-0.5 rounded font-mono ${
                        p === "trade" || p === "execute" ? "bg-red-500/20 text-red-300"
                        : p === "write" ? "bg-amber-500/20 text-amber-300"
                        : "bg-green-500/20 text-green-300"
                      }`}>{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Plugin details modal */}
      {selected && (
        <div onClick={() => setSelected(null)}
             className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()}
               className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-panel/95 backdrop-blur p-5 border-b border-border flex items-start gap-3">
              <span className="text-4xl">{selected.icon}</span>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{selected.name}</h2>
                <div className="text-xs text-gray-500 font-mono">{selected.fullName}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              <p className="text-gray-300 leading-relaxed">{selected.description}</p>

              {/* Install */}
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Install</div>
                <div className="bg-bg/80 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                  <code className="text-accent">pnpm add {selected.fullName}</code>
                  <button onClick={() => copy(`pnpm add ${selected.fullName}`, "install")}
                          className="p-1.5 hover:bg-bg rounded transition">
                    {copied === "install" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* Usage */}
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Usage</div>
                <div className="bg-bg/80 rounded-lg p-3 font-mono text-xs relative">
                  <pre className="overflow-x-auto"><code className="text-gray-300">{`import ${selected.name.replace(/-/g, "")}Plugin from "${selected.fullName}";
import { createTalons } from "@open-talons/core";

const talons = createTalons({
  llm: { provider: "anthropic" },
}).use(${selected.name.replace(/-/g, "")}Plugin);

const result = await talons.run({
  agent: "${selected.agentMode || "auto"}",
  prompt: "..."
});`}</code></pre>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="glass rounded-lg p-3">
                  <div className="text-2xl font-bold text-accent">{selected.tools}</div>
                  <div className="text-xs text-gray-500">Tools</div>
                </div>
                <div className="glass rounded-lg p-3">
                  <div className="text-sm font-mono text-accent2 capitalize">{selected.category}</div>
                  <div className="text-xs text-gray-500">Category</div>
                </div>
                <div className="glass rounded-lg p-3">
                  <div className="text-sm text-green-400">MIT</div>
                  <div className="text-xs text-gray-500">License</div>
                </div>
              </div>

              {/* Permissions */}
              {selected.permissions.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Permissions Required</div>
                  <div className="flex flex-wrap gap-2">
                    {selected.permissions.map((p) => (
                      <span key={p} className={`px-2 py-1 rounded text-xs font-mono ${
                        p === "trade" || p === "execute" ? "bg-red-500/20 text-red-300"
                        : p === "write" ? "bg-amber-500/20 text-amber-300"
                        : "bg-green-500/20 text-green-300"
                      }`}>{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Env keys */}
              {selected.envKeys.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Environment Keys</div>
                  <div className="space-y-1">
                    {selected.envKeys.map((k) => (
                      <code key={k} className="block text-xs font-mono text-gray-400 bg-bg/50 rounded px-3 py-1.5">{k}</code>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="flex gap-2 pt-3">
                <a href="/chat" className="flex-1 bg-accent text-white rounded-lg py-3 font-semibold text-center hover:opacity-90 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" /> Try in Chat
                </a>
                <a href={`https://github.com/muammeryldrm42/talonssss/tree/main/packages/plugins/${selected.name}`}
                   target="_blank" rel="noreferrer"
                   className="bg-panel border border-border rounded-lg px-4 py-3 hover:border-accent">
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
