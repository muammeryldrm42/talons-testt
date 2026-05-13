"use client";

import { useState } from "react";
import {
  Package, Github, Star, Download, Copy, Check, Search,
  ChevronLeft, ExternalLink, Code, Zap,
} from "lucide-react";

interface Plugin {
  name: string;
  pkg: string;
  icon: string;
  category: string;
  description: string;
  tools: number;
  permissions: string[];
  author: string;
  free: boolean;
  installable: boolean;
  agentMode?: string;
}

const PLUGINS: Plugin[] = [
  // Crypto plugins
  { name: "Bags.fm", pkg: "@open-talons/plugin-bagsfm", icon: "🎒", category: "Crypto", description: "Solana memecoin launchpad with creator fee tokens. Search, trending, 0-100 scoring.", tools: 5, permissions: ["read"], author: "Talons Protocol", free: true, installable: true, agentMode: "bagsfm" },
  { name: "Pump.fun", pkg: "@open-talons/plugin-pumpfun", icon: "🚀", category: "Crypto", description: "Pump.fun bonding curve memecoins + Raydium migration tracker.", tools: 3, permissions: ["read"], author: "Talons Protocol", free: true, installable: true, agentMode: "pumpfun" },
  { name: "Solana", pkg: "@open-talons/plugin-solana", icon: "☀️", category: "Crypto", description: "Jupiter, Raydium, Orca, LSTs, Drift, Kamino, Helius DAS.", tools: 12, permissions: ["read"], author: "Talons Protocol", free: true, installable: true, agentMode: "solana" },
  { name: "Solana Dev", pkg: "@open-talons/plugin-solana-dev", icon: "🛠", category: "Crypto", description: "Anchor IDL, Token-2022, cNFT, compute units, RPC health.", tools: 7, permissions: ["read"], author: "Talons Protocol", free: true, installable: true, agentMode: "soldev" },
  { name: "Base Network", pkg: "@open-talons/plugin-base-meme", icon: "🔷", category: "Crypto", description: "Clanker memes, Virtuals AI agents, Aerodrome pools on Base.", tools: 4, permissions: ["read"], author: "Talons Protocol", free: true, installable: true, agentMode: "base" },
  { name: "Crypto Markets", pkg: "@open-talons/plugin-crypto", icon: "📈", category: "Crypto", description: "Prices, TA, fear & greed, trending coins, global market.", tools: 6, permissions: ["read"], author: "Talons Protocol", free: true, installable: true, agentMode: "crypto" },
  { name: "Trading", pkg: "@open-talons/plugin-trading", icon: "📊", category: "Crypto", description: "Hyperliquid + Lighter perp DEX (DRY_RUN default).", tools: 6, permissions: ["read", "trade"], author: "Talons Protocol", free: true, installable: true, agentMode: "trading" },
  { name: "Quant", pkg: "@open-talons/plugin-strategies", icon: "🧮", category: "Crypto", description: "Strategy backtesting: EMA, RSI, MACD, Bollinger Bands.", tools: 6, permissions: ["read"], author: "Talons Protocol", free: true, installable: true, agentMode: "quant" },
  { name: "Security", pkg: "@open-talons/plugin-security", icon: "🛡", category: "Crypto", description: "GoPlus, RugCheck (Solana), phishing detection, approvals.", tools: 4, permissions: ["read"], author: "Talons Protocol", free: true, installable: true, agentMode: "security" },
  { name: "DeFi", pkg: "@open-talons/plugin-defi", icon: "🏦", category: "Crypto", description: "DefiLlama TVL, yields, stablecoins, protocol details.", tools: 5, permissions: ["read"], author: "Talons Protocol", free: true, installable: true, agentMode: "defi" },
  { name: "Twitter / X", pkg: "@open-talons/plugin-twitter", icon: "🐦", category: "Social", description: "Twitter sentiment, profiles, search.", tools: 3, permissions: ["external"], author: "Talons Protocol", free: true, installable: true, agentMode: "twitter" },
  { name: "On-Chain", pkg: "@open-talons/plugin-onchain", icon: "⛓", category: "Crypto", description: "ETH/Base/Solana wallets, tokens, transactions.", tools: 5, permissions: ["read"], author: "Talons Protocol", free: true, installable: true, agentMode: "onchain" },
  { name: "Whale Tracker", pkg: "@open-talons/plugin-whale", icon: "🐋", category: "Crypto", description: "Whale alerts, smart money flow, exchange flows.", tools: 5, permissions: ["read"], author: "Talons Protocol", free: true, installable: true, agentMode: "whale" },
  { name: "GitHub", pkg: "@open-talons/plugin-github", icon: "🐙", category: "Dev", description: "Repos, issues, PRs, code search, compare.", tools: 8, permissions: ["read", "write"], author: "Talons Protocol", free: true, installable: true, agentMode: "github" },
  { name: "Telegram", pkg: "@open-talons/plugin-telegram", icon: "📱", category: "Social", description: "Bot integration — send alerts, reports.", tools: 4, permissions: ["external"], author: "Talons Protocol", free: true, installable: true, agentMode: "telegram" },
  { name: "Macro", pkg: "@open-talons/plugin-macro", icon: "🔮", category: "Crypto", description: "DXY, yields, indices, forex, RSS news.", tools: 6, permissions: ["read"], author: "Talons Protocol", free: true, installable: true, agentMode: "macro" },
  { name: "Derivatives", pkg: "@open-talons/plugin-derivatives", icon: "📉", category: "Crypto", description: "OI, liquidations, L/S ratio, volatility ranking.", tools: 6, permissions: ["read"], author: "Talons Protocol", free: true, installable: true, agentMode: "derivatives" },
  { name: "Airdrop", pkg: "@open-talons/plugin-airdrop", icon: "🪂", category: "Crypto", description: "Airdrop radar, wallet eligibility checks.", tools: 10, permissions: ["read"], author: "Talons Protocol", free: true, installable: true, agentMode: "airdrop" },
  { name: "NFT", pkg: "@open-talons/plugin-nft", icon: "🎨", category: "Crypto", description: "Floor prices, trending collections.", tools: 2, permissions: ["read"], author: "Talons Protocol", free: true, installable: true, agentMode: "nft" },
  { name: "Meme Scanner", pkg: "@open-talons/plugin-memescan", icon: "🐸", category: "Crypto", description: "Multi-chain meme discovery + signal scoring.", tools: 4, permissions: ["read"], author: "Talons Protocol", free: true, installable: true, agentMode: "memescan" },
  { name: "Research", pkg: "@open-talons/plugin-research", icon: "🔍", category: "Productivity", description: "Web search, RSS feeds, news.", tools: 4, permissions: ["external"], author: "Talons Protocol", free: true, installable: true, agentMode: "research" },
  // General plugins
  { name: "Filesystem", pkg: "@open-talons/plugin-filesystem", icon: "📁", category: "Productivity", description: "Read, write, edit, list workspace files. Permission-gated.", tools: 6, permissions: ["read", "write"], author: "Talons Protocol", free: true, installable: true, agentMode: "filesystem" },
  { name: "Shell", pkg: "@open-talons/plugin-shell", icon: "💻", category: "Productivity", description: "Execute bash commands (permission-gated, sandboxed).", tools: 3, permissions: ["execute"], author: "Talons Protocol", free: true, installable: true, agentMode: "shell" },
  { name: "Code Interpreter", pkg: "@open-talons/plugin-code", icon: "🔬", category: "Productivity", description: "Run Python / JS / TS in sandbox + pip/npm install.", tools: 5, permissions: ["execute"], author: "Talons Protocol", free: true, installable: true, agentMode: "code" },
  { name: "Image Gen", pkg: "@open-talons/plugin-imagegen", icon: "🎨", category: "Productivity", description: "DALL-E 3, Stable Diffusion, Replicate, FREE FLUX.1-schnell + Vision.", tools: 5, permissions: ["external"], author: "Talons Protocol", free: true, installable: true, agentMode: "imagegen" },
  { name: "Browser", pkg: "@open-talons/plugin-browser", icon: "🌐", category: "Productivity", description: "Playwright web scraping, screenshots, form filling.", tools: 6, permissions: ["external"], author: "Talons Protocol", free: true, installable: true, agentMode: "browser" },
  { name: "Email", pkg: "@open-talons/plugin-email", icon: "📧", category: "Productivity", description: "SMTP send, Gmail API, IMAP read.", tools: 4, permissions: ["external"], author: "Talons Protocol", free: true, installable: true, agentMode: "email" },
  { name: "Database", pkg: "@open-talons/plugin-database", icon: "🗃", category: "Productivity", description: "SQLite, PostgreSQL, MongoDB query tools.", tools: 7, permissions: ["execute"], author: "Talons Protocol", free: true, installable: true, agentMode: "database" },
  { name: "Voice", pkg: "@open-talons/plugin-voice", icon: "🔊", category: "Productivity", description: "TTS (ElevenLabs, OpenAI) + STT (Whisper, Groq Whisper).", tools: 5, permissions: ["external"], author: "Talons Protocol", free: true, installable: true, agentMode: "voice" },
];

const CATEGORIES = ["All", "Crypto", "Productivity", "Social", "Dev"];

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [copiedPkg, setCopiedPkg] = useState("");

  const filtered = PLUGINS.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.pkg.toLowerCase().includes(q);
    }
    return true;
  });

  const totalTools = PLUGINS.reduce((acc, p) => acc + p.tools, 0);

  function copyInstall(pkg: string) {
    navigator.clipboard.writeText(`pnpm add ${pkg}`);
    setCopiedPkg(pkg);
    setTimeout(() => setCopiedPkg(""), 2000);
  }

  return (
    <main className="min-h-screen bg-bg text-white">
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-bg/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
              <ChevronLeft className="w-4 h-4" /> Home
            </a>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-accent" />
              <span className="font-bold gradient-text">Plugin Marketplace</span>
            </div>
          </div>
          <a href="/chat" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent text-white text-sm hover:opacity-90 transition">
            <Zap className="w-4 h-4" /> Live Chat
          </a>
        </div>
      </header>

      {/* Hero stats */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-6xl font-black text-center mb-4">
          <span className="gradient-text">Plugin Marketplace</span>
        </h1>
        <p className="text-center text-gray-500 mb-8 max-w-2xl mx-auto">
          Browse, install, and discover Open Talons plugins. MIT licensed. Build your own with the Plugin SDK.
        </p>

        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-3xl font-black gradient-text">{PLUGINS.length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Plugins</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-3xl font-black gradient-text">{totalTools}</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Tools</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-3xl font-black gradient-text">MIT</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Open Source</div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plugins... (e.g. solana, image, sql)"
              className="w-full bg-panel border border-border rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        category === cat ? "bg-accent text-white" : "bg-panel border border-border text-gray-400 hover:text-white"
                      }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Plugin grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.pkg} className="glass rounded-2xl p-5 transition group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{p.icon}</div>
                  <div>
                    <div className="font-bold text-lg">{p.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{p.pkg}</div>
                  </div>
                </div>
                <div className="text-[10px] text-accent2 bg-accent2/10 px-2 py-0.5 rounded">
                  {p.category}
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-4 leading-relaxed min-h-[40px]">{p.description}</p>

              <div className="flex flex-wrap gap-1 mb-4 text-[10px]">
                <span className="bg-bg border border-border rounded px-2 py-0.5">{p.tools} tools</span>
                {p.agentMode && <span className="bg-accent/10 border border-accent/30 text-accent rounded px-2 py-0.5">@{p.agentMode}</span>}
                {p.permissions.map((perm) => (
                  <span key={perm} className={`rounded px-2 py-0.5 border ${
                    perm === "trade" ? "bg-red-500/10 border-red-500/30 text-red-300" :
                    perm === "execute" || perm === "write" ? "bg-amber-500/10 border-amber-500/30 text-amber-300" :
                    "bg-bg border-border text-gray-500"
                  }`}>{perm}</span>
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={() => copyInstall(p.pkg)}
                        className="flex-1 flex items-center justify-center gap-2 bg-panel border border-border hover:border-accent text-sm rounded-lg px-3 py-2 transition">
                  {copiedPkg === p.pkg ? (
                    <><Check className="w-4 h-4 text-green-400" /> Copied!</>
                  ) : (
                    <><Download className="w-4 h-4" /> Install</>
                  )}
                </button>
                <a href={`/chat?agent=${p.agentMode || "auto"}`}
                   className="flex items-center justify-center gap-1 bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 text-sm rounded-lg px-3 py-2 transition">
                  <Zap className="w-4 h-4" /> Try
                </a>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No plugins match your search.</p>
          </div>
        )}
      </section>

      {/* Build your own CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-20 text-center">
        <div className="glass rounded-2xl p-8">
          <Code className="w-10 h-10 text-accent mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2">Build your own plugin</h2>
          <p className="text-sm text-gray-400 mb-4">
            30 lines is enough. Use the Plugin SDK with TypeScript types.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="https://github.com/muammeryldrm42/talonssss/tree/main/examples/custom-plugin" target="_blank" rel="noreferrer"
               className="flex items-center gap-2 bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 transition">
              <Github className="w-4 h-4" /> See example
            </a>
            <a href="https://github.com/muammeryldrm42/talonssss/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer"
               className="flex items-center gap-2 bg-panel border border-border rounded-lg px-4 py-2 text-sm hover:border-accent transition">
              <ExternalLink className="w-4 h-4" /> Docs
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
