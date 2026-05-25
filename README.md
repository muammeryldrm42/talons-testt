<div align="center">

# 🦅 Open Talons

**The open-source AI agent framework with first-class crypto support.**

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E=18-blue.svg)](#)
[![Plugins](https://img.shields.io/badge/plugins-31-purple.svg)](#)
[![LLMs](https://img.shields.io/badge/llm%20providers-12-cyan.svg)](#)
[![Agents](https://img.shields.io/badge/agents-22-orange.svg)](#)
[![Tools](https://img.shields.io/badge/tools-130%2B-yellow.svg)](#)

**[🌐 Live](https://opentalons.dev)** · **[💬 Chat](https://opentalons.dev/chat)** · **[📦 Plugins](https://opentalons.dev/plugins)** · **[📱 Telegram](https://opentalons.dev/playground)**

Built by [Talons Protocol](https://github.com/muammeryldrm42)

</div>

---

## 🎯 What is Open Talons?

**The OpenCode of crypto agents.** A modular, open-source AI agent framework.

- 🤖 **22 specialized agents** for crypto, trading, security, code, research
- 🧠 **12 LLM providers** (Claude, OpenAI, Gemini, Groq free, Ollama local)
- 🔌 **Plugin SDK** — write your own in 30 lines
- 🌐 **5 frontends** — CLI, Web, Docs, VSCode, Telegram
- 🛡 **Permission-gated** tool execution
- 🆓 **100% MIT** — self-hostable

---

## 🚀 Quick Start

```bash
git clone https://github.com/muammeryldrm42/talonssss
cd talonssss
pnpm install
pnpm build

cp .env.example .env  # set at least one LLM key
pnpm dev
```

Or try the [hosted web chat](https://opentalons.dev/chat) — bring your own API key.

---

## 💻 Use From Anywhere

| Frontend | Path | Use |
|----------|------|-----|
| 🦅 CLI | `apps/cli` | `talons --agent bagsfm` |
| 🌐 Web Dashboard | `apps/website` | `pnpm dev` → http://localhost:3000/chat |
| 📚 Docs | `apps/docs` | `pnpm dev` → http://localhost:3001 |
| 📝 VSCode Extension | `apps/vscode-extension` | Install .vsix, sidebar chat |
| 📱 Telegram Bot | `apps/telegram-bot` | Set token, run, message your bot |

---

## ⚡ 22 Built-in Agents

**Crypto (16):** bagsfm 🎒 · pumpfun 🚀 · solana ☀️ · soldev 🛠 · base 🔷 · crypto 📈 · trading 📊 · quant 🧮 · security 🛡 · defi 🏦 · onchain ⛓ · whale 🐋 · macro 🔮 · derivatives 📉 · airdrop 🪂 · memescan 🐸 · nft 🎨

**General (8):** filesystem 📁 · shell 💻 · code 🔬 · browser 🌐 · email 📧 · database 🗃 · imagegen 🎨 · voice 🔊

**Social/Dev (3):** research 🔍 · twitter 🐦 · telegram 📱 · github 🐙 · auto 🛸

---

## 🔌 Write Your Own Plugin

```typescript
import { definePlugin, defineTool, defineAgent, inputSchema } from "@open-talons/plugin-sdk";

export default definePlugin({
  name: "my-plugin",
  version: "1.0.0",
  tools: [
    defineTool({
      name: "my_tool",
      description: "Does something useful",
      inputSchema: inputSchema({ q: { type: "string", description: "Query" } }, ["q"]),
      handler: async ({ q }) => ({ success: true, data: { result: q } }),
    }),
  ],
  agents: [defineAgent({
    mode: "myagent",
    icon: "🎯",
    systemPrompt: "...",
    allowedTools: ["my_tool"],
  })],
});
```

---

## 🧠 LLM Providers

**Free:** Gemini (15 RPM), Groq (fast + free), Ollama (local), LM Studio (local)  
**Paid:** Anthropic Claude, OpenAI GPT-4/o1, xAI Grok, DeepSeek R1/V3, Mistral, Together, Perplexity  
**Hub:** OpenRouter (1 key → 200+ models)

Swap any time:
```typescript
talons.setLLM("groq", "llama-3.3-70b-versatile");
```

---

## 🛡 Safety

- 🔒 Trading defaults to **DRY_RUN** — set `HL_LIVE_TRADING=true` only when ready
- ⚠️ Tools tagged `write`/`execute`/`trade` **prompt before running**
- 🗝 Private keys stay **local** (only `.env`)
- 💾 Memory **per-workspace**, stored locally
- 🚫 Dangerous patterns blocked (`rm -rf /`, fork bombs, `DROP DATABASE`)

---

## 🛣 Roadmap

✅ **v2.x (NOW)** — Multi-LLM, 31 plugins, plugin SDK, permissions, skills, orchestrator, streaming, MCP, smart routing, caching, web dashboard, VSCode extension, Telegram bot, docs site, CI/CD

🔄 **v3.0** — Voice-first interface, multi-agent debates, plugin marketplace backend, mobile apps, embeddings/RAG, workflow builder

---

## 🤝 Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).
![Divider](http://localhost:3000/api/divider?style=gradient&width=900&height=60&color=ff5b14&color2=00ffd1&thickness=2&animated=true)
---

## 📜 License

MIT — Built with ❤️ by [@muammeryldrm42](https://github.com/muammeryldrm42) under Talons Protocol 🦅

*"Cömertlik bizim markamız."* — Open source, free, for everyone.
