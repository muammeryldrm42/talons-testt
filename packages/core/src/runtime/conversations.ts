// ============================================================
// 🦅 @open-talons/core — Conversation Persistence
// Save/load chat history per conversation ID
// ============================================================

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { LLMMessage } from "../types";

export interface Conversation {
  id: string;
  agent: string;
  llmProvider: string;
  llmModel: string;
  createdAt: number;
  updatedAt: number;
  messages: LLMMessage[];
  metadata: {
    totalTokens?: number;
    title?: string;
    pinned?: boolean;
  };
}

export class ConversationManager {
  private dir: string;
  private active: Map<string, Conversation> = new Map();

  constructor(workspacePath: string) {
    this.dir = path.join(workspacePath, "conversations");
    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir, { recursive: true });
  }

  /**
   * Create a new conversation.
   */
  create(agent: string, llmProvider: string, llmModel: string): Conversation {
    const id = crypto.randomBytes(8).toString("hex");
    const conv: Conversation = {
      id,
      agent,
      llmProvider,
      llmModel,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      metadata: {},
    };
    this.active.set(id, conv);
    this.save(conv);
    return conv;
  }

  /**
   * Load a conversation by ID.
   */
  load(id: string): Conversation | null {
    if (this.active.has(id)) return this.active.get(id)!;
    const filePath = path.join(this.dir, `${id}.json`);
    if (!fs.existsSync(filePath)) return null;
    try {
      const conv = JSON.parse(fs.readFileSync(filePath, "utf8")) as Conversation;
      this.active.set(id, conv);
      return conv;
    } catch {
      return null;
    }
  }

  /**
   * Append a message to a conversation.
   */
  addMessage(id: string, message: LLMMessage): void {
    const conv = this.active.get(id);
    if (!conv) return;
    conv.messages.push(message);
    conv.updatedAt = Date.now();
    if (!conv.metadata.title && message.role === "user") {
      const text = typeof message.content === "string" ? message.content : "";
      conv.metadata.title = text.slice(0, 50);
    }
    this.save(conv);
  }

  /**
   * Save conversation to disk.
   */
  save(conv: Conversation): void {
    try {
      const filePath = path.join(this.dir, `${conv.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(conv, null, 2));
    } catch (e) {
      console.error("Failed to save conversation:", e);
    }
  }

  /**
   * List all conversations (metadata only).
   */
  list(): Array<{ id: string; agent: string; title: string; updatedAt: number; messageCount: number }> {
    if (!fs.existsSync(this.dir)) return [];
    const files = fs.readdirSync(this.dir).filter((f) => f.endsWith(".json"));
    const convs = files.map((f) => {
      try {
        const conv = JSON.parse(fs.readFileSync(path.join(this.dir, f), "utf8")) as Conversation;
        return {
          id: conv.id,
          agent: conv.agent,
          title: conv.metadata?.title || "Untitled",
          updatedAt: conv.updatedAt,
          messageCount: conv.messages.length,
        };
      } catch {
        return null;
      }
    }).filter((c) => c !== null);
    return (convs as any[]).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Delete a conversation.
   */
  delete(id: string): boolean {
    this.active.delete(id);
    const filePath = path.join(this.dir, `${id}.json`);
    if (!fs.existsSync(filePath)) return false;
    fs.unlinkSync(filePath);
    return true;
  }

  /**
   * Pin/unpin conversation.
   */
  setPinned(id: string, pinned: boolean): boolean {
    const conv = this.load(id);
    if (!conv) return false;
    conv.metadata.pinned = pinned;
    this.save(conv);
    return true;
  }

  /**
   * Search conversations by content.
   */
  search(query: string): Array<{ id: string; title: string; preview: string; updatedAt: number }> {
    const list = this.list();
    const q = query.toLowerCase();
    return list
      .map((meta) => {
        const conv = this.load(meta.id);
        if (!conv) return null;
        const allText = conv.messages
          .map((m) => (typeof m.content === "string" ? m.content : ""))
          .join("\n")
          .toLowerCase();
        if (!allText.includes(q)) return null;
        const idx = allText.indexOf(q);
        const preview = allText.slice(Math.max(0, idx - 30), idx + 100);
        return { id: conv.id, title: meta.title, preview, updatedAt: meta.updatedAt };
      })
      .filter((c) => c !== null) as any[];
  }
}
