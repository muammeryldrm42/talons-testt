# Open Talons — Roadmap

## ✅ v2.6 (Current)

### Core
- Multi-LLM (12 providers): Anthropic, OpenAI, Gemini, Grok, DeepSeek, Mistral, Groq, Together, OpenRouter, Ollama, LM Studio, Perplexity
- Plugin SDK (definePlugin/defineTool/defineAgent/inputSchema)
- Permission system (allow_always/ask/deny per tool)
- Skills system (OpenCode SKILL.md style)
- Memory per workspace
- Sub-agent orchestrator with depth protection
- Streaming responses (all providers)
- Conversation persistence
- MCP server integration (Anthropic standard)
- Smart routing (keyword + LLM fallback)
- LRU cache + request batching

### Plugins (31)
- Crypto: bagsfm, pumpfun, solana, solana-dev, base-meme, crypto, trading, strategies, security, defi, onchain, whale, derivatives, memescan, airdrop, nft
- Social/Dev: twitter, telegram, github
- Research: research, macro
- General: filesystem, shell, code, browser, email, database, imagegen, voice

### Frontends
- CLI (interactive REPL with slash commands)
- Web Dashboard (Next.js, streaming, conversation sidebar)
- Plugins Marketplace page
- Telegram Setup page
- VSCode Extension (sidebar chat + "ask about selection")
- Docs Site (Next.js with sidebar nav)
- Telegram Bot (bidirectional, ACL, mode-per-user)

### Infra
- 4 GitHub Actions workflows (build, publish, release, codeql)
- Vercel-ready monorepo
- pnpm workspace structure

## 🔄 v3.0 (Next Quarter)

- [ ] Voice-first interface (push-to-talk audio chat)
- [ ] Multi-agent debates (agents discuss before answering)
- [ ] Plugin marketplace backend (community submissions, npm publish automation)
- [ ] Mobile apps (iOS/Android via React Native or Capacitor)
- [ ] Embeddings + RAG plugin
- [ ] Workflow builder (no-code agent chains)
- [ ] Full Telegram bot with voice
- [ ] Demo videos & screenshots
- [ ] Plugin hot-reload
