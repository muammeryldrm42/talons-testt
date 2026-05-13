"use client";

import { useState } from "react";
import { ChevronRight, Github, Home, BookOpen, Zap, Code, Package, Shield, Cpu } from "lucide-react";

const SECTIONS = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Zap,
    items: [
      { id: "intro", title: "Introduction" },
      { id: "quickstart", title: "Quick Start" },
      { id: "installation", title: "Installation" },
      { id: "first-agent", title: "Your First Agent" },
    ],
  },
  {
    id: "core-concepts",
    title: "Core Concepts",
    icon: BookOpen,
    items: [
      { id: "agents", title: "Agents" },
      { id: "tools", title: "Tools" },
      { id: "plugins", title: "Plugins" },
      { id: "providers", title: "LLM Providers" },
      { id: "permissions", title: "Permissions" },
    ],
  },
  {
    id: "plugin-development",
    title: "Plugin Development",
    icon: Package,
    items: [
      { id: "create-plugin", title: "Create a Plugin" },
      { id: "define-tool", title: "Define Tools" },
      { id: "define-agent", title: "Define Agents" },
      { id: "publish", title: "Publish to npm" },
    ],
  },
  {
    id: "advanced",
    title: "Advanced",
    icon: Cpu,
    items: [
      { id: "orchestrator", title: "Sub-agent Orchestrator" },
      { id: "streaming", title: "Streaming Responses" },
      { id: "mcp", title: "MCP Server Integration" },
      { id: "routing", title: "Smart Routing" },
      { id: "skills", title: "Skills System" },
    ],
  },
  {
    id: "deployment",
    title: "Deployment",
    icon: Shield,
    items: [
      { id: "cli-deploy", title: "CLI" },
      { id: "web-deploy", title: "Web Dashboard" },
      { id: "vscode-deploy", title: "VSCode Extension" },
      { id: "telegram-deploy", title: "Telegram Bot" },
      { id: "self-host", title: "Self-Hosting" },
    ],
  },
];

const CONTENT: Record<string, { title: string; body: JSX.Element }> = {
  intro: {
    title: "Introduction",
    body: (
      <>
        <p><strong>Open Talons</strong> is an open-source AI agent framework with first-class crypto support. Think of it as the OpenCode of crypto agents.</p>
        <h2>What you get</h2>
        <ul>
          <li><strong>22 specialized agents</strong> — Bags.fm, Pump.fun, Solana, Trading, Security, and more</li>
          <li><strong>12 LLM providers</strong> — Claude, OpenAI, Gemini, Groq (free), Ollama (local), etc.</li>
          <li><strong>130+ tools</strong> across crypto, research, code, browser, email, database</li>
          <li><strong>Plugin SDK</strong> — write your own in 30 lines</li>
          <li><strong>Permission system</strong> — gated tool execution</li>
          <li><strong>Multiple frontends</strong> — CLI, web dashboard, VSCode extension, Telegram bot</li>
        </ul>
        <h2>Architecture</h2>
        <p>Open Talons is a pnpm monorepo with these key packages:</p>
        <ul>
          <li><code>@open-talons/core</code> — runtime engine, LLM providers, plugin registry</li>
          <li><code>@open-talons/plugin-sdk</code> — public API for plugin authors</li>
          <li><code>@open-talons/plugin-*</code> — 29 built-in plugins</li>
          <li><code>@open-talons/cli</code> — interactive REPL</li>
        </ul>
      </>
    ),
  },
  quickstart: {
    title: "Quick Start",
    body: (
      <>
        <h2>1. Clone & install</h2>
        <pre><code>{`git clone https://github.com/muammeryldrm42/talonssss
cd talonssss
pnpm install
pnpm build`}</code></pre>

        <h2>2. Configure</h2>
        <p>Copy <code>.env.example</code> to <code>.env</code> and set at least one LLM key:</p>
        <pre><code>{`# Free options:
GEMINI_API_KEY=...     # 15 RPM free
GROQ_API_KEY=...       # blazing fast, free tier

# Or paid:
ANTHROPIC_API_KEY=...  # best tool use

# Or local:
OLLAMA_HOST=http://localhost:11434`}</code></pre>

        <h2>3. Run</h2>
        <pre><code>{`pnpm dev
# or
talons --agent bagsfm`}</code></pre>

        <h2>Live Chat</h2>
        <p>Or try without installing — open <a href="https://opentalons.dev/chat">our hosted chat</a> and bring your own API key.</p>
      </>
    ),
  },
  installation: {
    title: "Installation",
    body: (
      <>
        <h2>Prerequisites</h2>
        <ul>
          <li><strong>Node.js 18+</strong></li>
          <li><strong>pnpm 9+</strong> — install via <code>npm install -g pnpm</code></li>
        </ul>

        <h2>From Source</h2>
        <pre><code>{`git clone https://github.com/muammeryldrm42/talonssss
cd talonssss
pnpm install
pnpm build`}</code></pre>

        <h2>As Library</h2>
        <p>To use Open Talons in your own project:</p>
        <pre><code>{`pnpm add @open-talons/core @open-talons/plugin-bagsfm`}</code></pre>

        <h2>Optional Plugin Dependencies</h2>
        <p>Some plugins need extra packages:</p>
        <ul>
          <li><strong>plugin-browser</strong>: <code>pnpm add playwright && npx playwright install chromium</code></li>
          <li><strong>plugin-email</strong>: <code>pnpm add nodemailer imapflow</code></li>
          <li><strong>plugin-database</strong>: <code>pnpm add better-sqlite3 pg mongodb</code></li>
        </ul>
      </>
    ),
  },
  agents: {
    title: "Agents",
    body: (
      <>
        <p>An <strong>agent</strong> is a specialized persona with its own system prompt and tool set. Open Talons ships with 22 built-in agents.</p>

        <h2>Using an Agent</h2>
        <pre><code>{`import { createTalons } from "@open-talons/core";
import bagsfmPlugin from "@open-talons/plugin-bagsfm";

const talons = createTalons({ llm: { provider: "anthropic" } })
  .use(bagsfmPlugin);

const result = await talons.run({
  agent: "bagsfm",
  prompt: "Find trending Bags.fm tokens last hour"
});`}</code></pre>

        <h2>Defining Your Own Agent</h2>
        <pre><code>{`import { defineAgent } from "@open-talons/plugin-sdk";

export const myAgent = defineAgent({
  mode: "myagent",
  icon: "🎯",
  name: "Custom Analyst",
  systemPrompt: "You are a data analyst...",
  allowedTools: ["my_tool", "another_tool"],
});`}</code></pre>

        <h2>Built-in Agents</h2>
        <ul>
          <li><code>auto</code> 🛸 — All tools, agent picks automatically</li>
          <li><code>bagsfm</code> 🎒 — Bags.fm Solana memecoins</li>
          <li><code>pumpfun</code> 🚀 — Pump.fun bonding curves</li>
          <li><code>solana</code> ☀️ — Solana ecosystem</li>
          <li><code>trading</code> 📊 — Perp DEX trading</li>
          <li><code>security</code> 🛡 — Token security</li>
          <li>...and 16 more</li>
        </ul>
      </>
    ),
  },
  "create-plugin": {
    title: "Create a Plugin",
    body: (
      <>
        <h2>Plugin Structure</h2>
        <pre><code>{`my-plugin/
├── src/
│   └── index.ts
├── package.json
└── tsconfig.json`}</code></pre>

        <h2>Full Example</h2>
        <pre><code>{`import { definePlugin, defineTool, defineAgent, inputSchema } from "@open-talons/plugin-sdk";

export default definePlugin({
  name: "my-plugin",
  version: "1.0.0",
  author: "Your Name",
  description: "My awesome plugin",
  license: "MIT",

  tools: [
    defineTool({
      name: "my_tool",
      description: "Does something useful",
      inputSchema: inputSchema({
        query: { type: "string", description: "What to search" },
        limit: { type: "number", description: "Max results" },
      }, ["query"]),
      handler: async ({ query, limit }, ctx) => {
        // ctx.env — environment variables
        // ctx.log — log helper
        // ctx.fetch — HTTP fetch
        // ctx.workspace — workspace context

        const data = await fetch(\`https://api.example.com?q=\${query}\`);
        return { success: true, data: await data.json() };
      },
      category: "custom",
      permission: "external", // read | write | execute | external | trade
    }),
  ],

  agents: [
    defineAgent({
      mode: "myagent",
      icon: "🎯",
      name: "My Agent",
      systemPrompt: "You are a specialist in...",
      allowedTools: ["my_tool"],
    }),
  ],
});`}</code></pre>

        <h2>Using It</h2>
        <pre><code>{`import { createTalons } from "@open-talons/core";
import myPlugin from "./my-plugin";

const talons = createTalons({ llm: { provider: "groq" } })
  .use(myPlugin);

await talons.run({ agent: "myagent", prompt: "..." });`}</code></pre>
      </>
    ),
  },
  orchestrator: {
    title: "Sub-agent Orchestrator",
    body: (
      <>
        <p>The orchestrator lets a master agent <strong>delegate</strong> sub-tasks to specialized child agents.</p>

        <h2>Use Case</h2>
        <p>A trading agent receives <em>"Should I buy SOL?"</em>. It can:</p>
        <ol>
          <li>Delegate to <code>crypto</code> agent for TA</li>
          <li>Delegate to <code>twitter</code> agent for sentiment</li>
          <li>Delegate to <code>macro</code> agent for risk-on/off</li>
          <li>Synthesize results into a recommendation</li>
        </ol>

        <h2>Example</h2>
        <pre><code>{`import { Orchestrator } from "@open-talons/core";

const orchestrator = new Orchestrator({
  registry: talons.getRegistry(),
  workspace: talons.getWorkspace(),
  defaultLLM: { provider: "anthropic" },
  maxDelegationDepth: 3, // prevent infinite recursion
});

const result = await orchestrator.delegate({
  childAgent: "security",
  prompt: "Check token 0xABC...DEF for rug risk",
});

console.log(result.output);`}</code></pre>

        <h2>Auto-delegation Tool</h2>
        <p>Inject the <code>delegate_to_agent</code> tool into a master agent, and it will choose when to delegate:</p>
        <pre><code>{`const masterAgent = defineAgent({
  mode: "master",
  systemPrompt: "You can delegate to specialized agents via delegate_to_agent tool",
  allowedTools: ["delegate_to_agent", "other_tools..."],
});`}</code></pre>
      </>
    ),
  },
};

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [activeItem, setActiveItem] = useState("intro");

  const content = CONTENT[activeItem] || { title: "Coming soon", body: <p>This section is being written. Check back soon!</p> };

  return (
    <main className="min-h-screen flex bg-bg text-white">
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-panel/50 backdrop-blur border-r border-border h-screen sticky top-0">
        <div className="p-4 border-b border-border">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl">🦅</span>
            <div>
              <div className="font-bold gradient-text">Open Talons</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Documentation</div>
            </div>
          </a>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {SECTIONS.map((sec) => (
            <div key={sec.id}>
              <button
                onClick={() => setActiveSection(sec.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs uppercase text-gray-400 hover:text-white tracking-wider"
              >
                <sec.icon className="w-3.5 h-3.5" />
                {sec.title}
              </button>
              <div className="space-y-0.5 ml-3">
                {sec.items.map((item) => (
                  <button key={item.id}
                          onClick={() => setActiveItem(item.id)}
                          className={`w-full text-left px-2 py-1.5 rounded text-sm transition ${
                            activeItem === item.id ? "bg-accent/20 text-white" : "text-gray-400 hover:text-white hover:bg-bg/50"
                          }`}>
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-border">
          <a href="https://github.com/muammeryldrm42/talonssss"
             className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-400 hover:text-white">
            <Github className="w-3.5 h-3.5" /> GitHub
          </a>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto px-6 md:px-12 py-12 relative">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <span>Docs</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-accent">{content.title}</span>
        </div>

        <div className="prose-doc">
          <h1 className="text-4xl font-black mb-6 gradient-text">{content.title}</h1>
          {content.body}
        </div>

        <div className="mt-16 pt-6 border-t border-border flex items-center justify-between text-sm text-gray-500">
          <a href="https://github.com/muammeryldrm42/talonssss/edit/main/docs/" className="hover:text-white">
            ✏ Edit this page on GitHub
          </a>
          <a href="/" className="hover:text-white flex items-center gap-1">
            <Home className="w-4 h-4" /> Back to site
          </a>
        </div>
      </div>
    </main>
  );
}
