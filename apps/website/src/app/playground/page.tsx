"use client";

import { useState, useEffect } from "react";
import { Github, Home, Copy, Check, ExternalLink, Bot, MessageSquare, Send, AlertCircle } from "lucide-react";

export default function PlaygroundPage() {
  const [copied, setCopied] = useState("");

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
            <span className="text-xs text-gray-500 ml-2 hidden sm:inline">Telegram Setup</span>
          </a>
          <div className="flex items-center gap-2">
            <a href="/chat" className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30 text-accent text-sm hover:bg-accent/20">
              💬 Web Chat
            </a>
            <a href="/plugins" className="p-2 rounded-lg bg-panel border border-border hover:border-accent text-sm">
              📦
            </a>
            <a href="/" className="p-2 rounded-lg bg-panel border border-border hover:border-accent">
              <Home className="w-4 h-4" />
            </a>
          </div>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="gradient-text">Telegram Bot</span> Setup
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Use Open Talons agents directly from Telegram. Send messages, get alerts, run any agent on mobile.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent font-bold">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Create a Telegram Bot</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Message <code className="bg-bg/80 px-2 py-1 rounded text-accent">@BotFather</code> on Telegram and run:
                </p>
                <div className="bg-bg/80 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                  <code className="text-accent2">/newbot</code>
                  <a href="https://t.me/BotFather" target="_blank" rel="noreferrer"
                     className="text-accent hover:underline flex items-center gap-1 text-xs">
                    Open BotFather <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-2">Follow the prompts. BotFather will give you a token like <code>123456:ABC-DEF...</code></p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent font-bold">2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Get Your Chat ID</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Message <code className="bg-bg/80 px-2 py-1 rounded text-accent">@userinfobot</code> — it will reply with your chat ID.
                </p>
                <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-2 bg-accent/20 text-accent border border-accent/40 rounded-lg px-3 py-2 text-sm hover:bg-accent/30">
                  Open @userinfobot <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent font-bold">3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Configure .env</h3>
                <div className="bg-bg/80 rounded-lg p-4 font-mono text-sm relative group">
                  <button onClick={() => copy(`TELEGRAM_BOT_TOKEN=123456:ABC-DEF...\nTELEGRAM_CHAT_ID=123456789`, "env")}
                          className="absolute top-2 right-2 p-1.5 bg-bg rounded opacity-0 group-hover:opacity-100 transition">
                    {copied === "env" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                  <div className="space-y-1 text-xs">
                    <div><span className="text-amber-400">TELEGRAM_BOT_TOKEN</span>=<span className="text-gray-400">123456:ABC-DEF...</span></div>
                    <div><span className="text-amber-400">TELEGRAM_CHAT_ID</span>=<span className="text-gray-400">123456789</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent font-bold">4</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Use from CLI or Library</h3>
                <p className="text-sm text-gray-400 mb-3">Tell any agent to send to Telegram:</p>

                <div className="bg-bg/80 rounded-lg p-4 font-mono text-sm relative group mb-3">
                  <button onClick={() => copy(`talons --agent telegram --query "Send my daily crypto report to Telegram"`, "cli")}
                          className="absolute top-2 right-2 p-1.5 bg-bg rounded opacity-0 group-hover:opacity-100 transition">
                    {copied === "cli" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                  <code className="text-gray-300">
                    <span className="text-gray-600">$</span> <span className="text-accent2">talons</span> --agent <span className="text-accent">telegram</span> --query <span className="text-green-400">"Send my daily crypto report to Telegram"</span>
                  </code>
                </div>

                <div className="bg-bg/80 rounded-lg p-4 font-mono text-sm relative group">
                  <button onClick={() => copy(`import { createTalons } from "@open-talons/core";\nimport telegramPlugin from "@open-talons/plugin-telegram";\n\nconst talons = createTalons({ llm: { provider: "anthropic" } }).use(telegramPlugin);\nawait talons.run({ agent: "telegram", prompt: "Send 'Hello from Open Talons' to my Telegram" });`, "lib")}
                          className="absolute top-2 right-2 p-1.5 bg-bg rounded opacity-0 group-hover:opacity-100 transition">
                    {copied === "lib" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                  <pre className="text-xs text-gray-300 overflow-x-auto"><code>{`import { createTalons } from "@open-talons/core";
import telegramPlugin from "@open-talons/plugin-telegram";

const talons = createTalons({ llm: { provider: "anthropic" } })
  .use(telegramPlugin);

await talons.run({
  agent: "telegram",
  prompt: "Send 'Hello from Open Talons' to my Telegram"
});`}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Use cases */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">What Can You Do?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "📊", title: "Crypto Alerts", desc: "Daily BTC/ETH price alerts, fear & greed updates" },
              { icon: "🐋", title: "Whale Notifications", desc: "Big transfers, smart money moves, exchange flows" },
              { icon: "🎒", title: "Bags.fm Signals", desc: "Trending tokens, new launches, creator analysis" },
              { icon: "📈", title: "Trading Reports", desc: "Hyperliquid positions, funding rates, P&L summary" },
              { icon: "🪂", title: "Airdrop Alerts", desc: "New airdrops, eligibility checks, claim reminders" },
              { icon: "🚀", title: "Pump.fun Graduations", desc: "Tokens close to Raydium migration ($69k mcap)" },
            ].map((u) => (
              <div key={u.title} className="glass rounded-xl p-5">
                <div className="text-3xl mb-2">{u.icon}</div>
                <h3 className="font-bold mb-1">{u.title}</h3>
                <p className="text-xs text-gray-400">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notice */}
        <div className="mt-12 glass rounded-2xl p-5 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-300 mb-1">Coming Soon: Full Telegram Bot</h4>
              <p className="text-sm text-gray-400">
                Currently the Telegram plugin lets you SEND messages from Open Talons. A full bidirectional bot
                (receive commands from Telegram, run agents from your phone) is coming in v3.0.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
