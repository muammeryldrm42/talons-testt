// ============================================================
// 🦅 Open Talons VSCode Extension
// Chat with agents directly from VSCode sidebar
// ============================================================

import * as vscode from "vscode";

const AGENTS = [
  { mode: "auto", icon: "🛸", name: "Auto", prompt: "You are Open Talons, a multi-capability AI agent. Help with anything — crypto, coding, research, analysis." },
  { mode: "bagsfm", icon: "🎒", name: "Bags.fm", prompt: "🎒 Bags.fm Solana memecoin expert." },
  { mode: "pumpfun", icon: "🚀", name: "Pump.fun", prompt: "🚀 Pump.fun bonding curve expert." },
  { mode: "solana", icon: "☀️", name: "Solana", prompt: "☀️ Solana ecosystem expert." },
  { mode: "crypto", icon: "📈", name: "Crypto", prompt: "📈 Crypto market analyst. ⚠️ Not financial advice." },
  { mode: "trading", icon: "📊", name: "Trading", prompt: "📊 Perp trading expert. ⚠️ Risk first." },
  { mode: "security", icon: "🛡", name: "Security", prompt: "🛡 Token security expert." },
  { mode: "code", icon: "🔬", name: "Code Helper", prompt: "🔬 Code helper. Python, JS, TS expert." },
  { mode: "research", icon: "🔍", name: "Research", prompt: "🔍 Research analyst." },
];

const PROVIDERS = [
  { id: "anthropic", name: "Anthropic Claude", defaultModel: "claude-opus-4-5" },
  { id: "openai", name: "OpenAI", defaultModel: "gpt-4o" },
  { id: "groq", name: "Groq (FREE)", defaultModel: "llama-3.3-70b-versatile" },
  { id: "gemini", name: "Google Gemini (FREE)", defaultModel: "gemini-1.5-pro" },
  { id: "deepseek", name: "DeepSeek", defaultModel: "deepseek-chat" },
  { id: "openrouter", name: "OpenRouter", defaultModel: "anthropic/claude-3.5-sonnet" },
];

export function activate(context: vscode.ExtensionContext) {
  const provider = new TalonsViewProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("openTalons.chatView", provider, {
      webviewOptions: { retainContextWhenHidden: true },
    }),

    vscode.commands.registerCommand("openTalons.openChat", () => {
      vscode.commands.executeCommand("openTalons.chatView.focus");
    }),

    vscode.commands.registerCommand("openTalons.askAboutSelection", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const selection = editor.document.getText(editor.selection);
      if (!selection) {
        vscode.window.showInformationMessage("Select some code first.");
        return;
      }
      const question = await vscode.window.showInputBox({
        prompt: "Ask Open Talons about this code",
        placeHolder: "What does this do? / Optimize this / Explain...",
      });
      if (!question) return;
      const fullPrompt = `${question}\n\n\`\`\`${editor.document.languageId}\n${selection}\n\`\`\``;
      provider.sendMessage("code", fullPrompt);
    }),

    vscode.commands.registerCommand("openTalons.settings", () => {
      vscode.commands.executeCommand("workbench.action.openSettings", "openTalons");
    })
  );
}

class TalonsViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtml();

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === "chat") {
        await this.handleChat(msg.provider, msg.apiKey, msg.model, msg.agent, msg.messages);
      } else if (msg.type === "saveSettings") {
        await this.context.globalState.update("settings", msg.settings);
      } else if (msg.type === "loadSettings") {
        const settings = this.context.globalState.get("settings", {});
        webviewView.webview.postMessage({ type: "settings", settings });
      } else if (msg.type === "insertCode") {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          editor.edit((b) => b.insert(editor.selection.active, msg.code));
        }
      }
    });
  }

  sendMessage(agent: string, prompt: string) {
    this._view?.webview.postMessage({ type: "userMessage", agent, prompt });
  }

  async handleChat(provider: string, apiKey: string, model: string, agent: string, messages: any[]) {
    const agentDef = AGENTS.find((a) => a.mode === agent) || AGENTS[0];
    const useModel = model || PROVIDERS.find((p) => p.id === provider)?.defaultModel || "";

    try {
      if (provider === "anthropic") {
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: useModel,
            max_tokens: 4096,
            system: agentDef.prompt,
            messages,
          }),
        });
        const data: any = await r.json();
        if (!r.ok) {
          this._view?.webview.postMessage({ type: "error", error: data.error?.message || `Status ${r.status}` });
          return;
        }
        this._view?.webview.postMessage({ type: "assistant", text: data.content?.[0]?.text || "" });
      } else if (provider === "gemini") {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${useModel}:generateContent?key=${apiKey}`;
        const contents = messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: agentDef.prompt }] },
            generationConfig: { maxOutputTokens: 4096 },
          }),
        });
        const data: any = await r.json();
        if (!r.ok) {
          this._view?.webview.postMessage({ type: "error", error: data.error?.message });
          return;
        }
        const text = data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") || "";
        this._view?.webview.postMessage({ type: "assistant", text });
      } else {
        // OpenAI-compatible
        const endpoints: Record<string, string> = {
          openai: "https://api.openai.com/v1/chat/completions",
          groq: "https://api.groq.com/openai/v1/chat/completions",
          deepseek: "https://api.deepseek.com/v1/chat/completions",
          openrouter: "https://openrouter.ai/api/v1/chat/completions",
        };
        const r = await fetch(endpoints[provider] || endpoints.openai, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: useModel,
            messages: [{ role: "system", content: agentDef.prompt }, ...messages],
            max_tokens: 4096,
            temperature: 0.7,
          }),
        });
        const data: any = await r.json();
        if (!r.ok) {
          this._view?.webview.postMessage({ type: "error", error: data.error?.message });
          return;
        }
        this._view?.webview.postMessage({ type: "assistant", text: data.choices?.[0]?.message?.content || "" });
      }
    } catch (e: any) {
      this._view?.webview.postMessage({ type: "error", error: e.message });
    }
  }

  getHtml(): string {
    return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); background: var(--vscode-editor-background); margin: 0; padding: 0; }
  .header { padding: 10px; border-bottom: 1px solid var(--vscode-panel-border); display: flex; gap: 6px; }
  select, input, button, textarea { background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); padding: 4px 8px; border-radius: 2px; font-family: inherit; font-size: 12px; }
  button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); cursor: pointer; border: none; }
  button:hover { background: var(--vscode-button-hoverBackground); }
  .messages { padding: 10px; height: calc(100vh - 200px); overflow-y: auto; }
  .msg { margin-bottom: 12px; padding: 8px 10px; border-radius: 4px; font-size: 13px; line-height: 1.5; white-space: pre-wrap; }
  .msg.user { background: var(--vscode-textBlockQuote-background); border-left: 3px solid var(--vscode-textLink-foreground); }
  .msg.assistant { background: var(--vscode-editorWidget-background); }
  .msg.error { background: rgba(255,0,0,0.1); color: #ff8888; }
  .input-row { padding: 10px; border-top: 1px solid var(--vscode-panel-border); display: flex; gap: 6px; align-items: flex-end; }
  textarea { flex: 1; resize: vertical; min-height: 40px; max-height: 200px; }
  .settings { padding: 10px; background: var(--vscode-sideBar-background); border-bottom: 1px solid var(--vscode-panel-border); display: none; }
  .settings.open { display: block; }
  .settings label { display: block; font-size: 11px; margin: 4px 0; color: var(--vscode-descriptionForeground); }
  .empty { padding: 30px 20px; text-align: center; color: var(--vscode-descriptionForeground); font-size: 13px; }
  pre { background: var(--vscode-textCodeBlock-background); padding: 8px; border-radius: 3px; overflow-x: auto; font-size: 12px; }
  code { background: var(--vscode-textCodeBlock-background); padding: 1px 4px; border-radius: 2px; font-size: 12px; }
</style>
</head>
<body>
  <div class="header">
    <select id="agent" style="flex: 1">
      ${AGENTS.map((a) => `<option value="${a.mode}">${a.icon} ${a.name}</option>`).join("")}
    </select>
    <button onclick="toggleSettings()">⚙</button>
    <button onclick="clearChat()">🗑</button>
  </div>

  <div id="settings" class="settings">
    <label>Provider</label>
    <select id="provider">
      ${PROVIDERS.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
    </select>
    <label>API Key (stored locally)</label>
    <input type="password" id="apiKey" placeholder="sk-..." style="width: 100%; box-sizing: border-box" />
    <label>Model (optional)</label>
    <input type="text" id="model" placeholder="defaults to recommended" style="width: 100%; box-sizing: border-box" />
    <button onclick="saveSettings()" style="margin-top: 8px; width: 100%">Save</button>
  </div>

  <div id="messages" class="messages">
    <div class="empty">🦅 Welcome to Open Talons<br><br>Pick an agent above, set your API key in ⚙ settings, then ask anything.</div>
  </div>

  <div class="input-row">
    <textarea id="input" placeholder="Ask anything... (Ctrl+Enter to send)" rows="1"></textarea>
    <button onclick="send()">Send</button>
  </div>

<script>
  const vscode = acquireVsCodeApi();
  let messages = [];
  let settings = { provider: "groq", apiKey: "", model: "" };

  vscode.postMessage({ type: "loadSettings" });

  window.addEventListener("message", (event) => {
    const msg = event.data;
    if (msg.type === "settings") {
      settings = { ...settings, ...msg.settings };
      document.getElementById("provider").value = settings.provider || "groq";
      document.getElementById("apiKey").value = settings.apiKey || "";
      document.getElementById("model").value = settings.model || "";
    } else if (msg.type === "assistant") {
      messages.push({ role: "assistant", content: msg.text });
      render();
    } else if (msg.type === "error") {
      addError(msg.error);
    } else if (msg.type === "userMessage") {
      document.getElementById("agent").value = msg.agent;
      document.getElementById("input").value = msg.prompt;
      send();
    }
  });

  function toggleSettings() {
    document.getElementById("settings").classList.toggle("open");
  }

  function saveSettings() {
    settings = {
      provider: document.getElementById("provider").value,
      apiKey: document.getElementById("apiKey").value,
      model: document.getElementById("model").value,
    };
    vscode.postMessage({ type: "saveSettings", settings });
    document.getElementById("settings").classList.remove("open");
  }

  function clearChat() {
    messages = [];
    render();
  }

  function send() {
    const input = document.getElementById("input");
    const text = input.value.trim();
    if (!text) return;
    if (!settings.apiKey) {
      addError("Set your API key in ⚙ settings first");
      document.getElementById("settings").classList.add("open");
      return;
    }
    messages.push({ role: "user", content: text });
    input.value = "";
    render();
    addMessage("assistant", "...");
    vscode.postMessage({
      type: "chat",
      provider: settings.provider,
      apiKey: settings.apiKey,
      model: settings.model,
      agent: document.getElementById("agent").value,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
  }

  function render() {
    const container = document.getElementById("messages");
    if (messages.length === 0) {
      container.innerHTML = '<div class="empty">🦅 Welcome to Open Talons<br><br>Pick an agent above, set your API key in ⚙ settings, then ask anything.</div>';
      return;
    }
    container.innerHTML = messages.map((m) =>
      \`<div class="msg \${m.role}">\${escapeHtml(m.content)}</div>\`
    ).join("");
    container.scrollTop = container.scrollHeight;
  }

  function addMessage(role, content) {
    messages.push({ role, content });
    render();
  }

  function addError(text) {
    // Replace last assistant placeholder if exists
    if (messages.length > 0 && messages[messages.length - 1].role === "assistant" && messages[messages.length - 1].content === "...") {
      messages.pop();
    }
    const container = document.getElementById("messages");
    const div = document.createElement("div");
    div.className = "msg error";
    div.textContent = "❌ " + text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  document.getElementById("input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      send();
    }
  });
</script>
</body>
</html>`;
  }
}

export function deactivate() {}
