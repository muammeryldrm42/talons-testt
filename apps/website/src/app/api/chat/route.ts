// ============================================================
// 🦅 Chat API — streaming support
// ============================================================

import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const maxDuration = 60;

type Provider = "anthropic" | "openai" | "groq" | "gemini" | "openrouter" | "deepseek" | "mistral" | "grok" | "together";

interface ChatRequest {
  provider: Provider;
  apiKey?: string;
  model?: string;
  systemPrompt?: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  stream?: boolean;
}

const DEFAULTS: Record<Provider, string> = {
  anthropic: "claude-opus-4-5",
  openai: "gpt-4o",
  groq: "llama-3.3-70b-versatile",
  gemini: "gemini-1.5-pro",
  openrouter: "anthropic/claude-3.5-sonnet",
  deepseek: "deepseek-chat",
  mistral: "mistral-large-latest",
  grok: "grok-2-latest",
  together: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
};

const OPENAI_COMPAT: Record<string, { url: string; extraHeaders?: Record<string, string> }> = {
  openai: { url: "https://api.openai.com/v1/chat/completions" },
  groq: { url: "https://api.groq.com/openai/v1/chat/completions" },
  deepseek: { url: "https://api.deepseek.com/v1/chat/completions" },
  mistral: { url: "https://api.mistral.ai/v1/chat/completions" },
  grok: { url: "https://api.x.ai/v1/chat/completions" },
  together: { url: "https://api.together.xyz/v1/chat/completions" },
  openrouter: {
    url: "https://openrouter.ai/api/v1/chat/completions",
    extraHeaders: { "HTTP-Referer": "https://opentalons.dev", "X-Title": "Open Talons" },
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ChatRequest;
    const { provider, apiKey, model, systemPrompt, messages, stream } = body;

    if (!provider) return NextResponse.json({ error: "provider required" }, { status: 400 });
    if (!apiKey) return NextResponse.json({ error: "API key required" }, { status: 400 });

    const useModel = model || DEFAULTS[provider];

    // Streaming response
    if (stream) {
      const streamRes = await callStreamingProvider(provider, apiKey, useModel, systemPrompt, messages);
      return new Response(streamRes, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Non-streaming
    return await callRegular(provider, apiKey, useModel, systemPrompt, messages);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

async function callRegular(
  provider: Provider, apiKey: string, model: string,
  systemPrompt: string | undefined, messages: Array<{ role: string; content: string }>
) {
  if (provider === "anthropic") {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens: 4096, system: systemPrompt, messages }),
    });
    const data = await r.json();
    if (!r.ok) return NextResponse.json({ error: data.error?.message || "Anthropic error" }, { status: r.status });
    return NextResponse.json({ text: data.content?.[0]?.text || "", model: data.model, usage: data.usage });
  }

  if (provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        ...(systemPrompt ? { systemInstruction: { parts: [{ text: systemPrompt }] } } : {}),
        generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
      }),
    });
    const data = await r.json();
    if (!r.ok) return NextResponse.json({ error: data.error?.message || "Gemini error" }, { status: r.status });
    return NextResponse.json({
      text: data.candidates?.[0]?.content?.parts?.map((p: { text: string }) => p.text).join("") || "",
      model,
      usage: data.usageMetadata,
    });
  }

  // OpenAI-compatible
  const cfg = OPENAI_COMPAT[provider];
  if (!cfg) return NextResponse.json({ error: `Unsupported provider: ${provider}` }, { status: 400 });

  const openaiMessages = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...messages]
    : messages;

  const r = await fetch(cfg.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(cfg.extraHeaders || {}),
    },
    body: JSON.stringify({ model, messages: openaiMessages, max_tokens: 4096, temperature: 0.7 }),
  });
  const data = await r.json();
  if (!r.ok) return NextResponse.json({ error: data.error?.message || `${provider} error` }, { status: r.status });
  return NextResponse.json({
    text: data.choices?.[0]?.message?.content || "",
    model: data.model,
    usage: data.usage,
  });
}

async function callStreamingProvider(
  provider: Provider, apiKey: string, model: string,
  systemPrompt: string | undefined, messages: Array<{ role: string; content: string }>
): Promise<ReadableStream> {
  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (data: object) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

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
              model, max_tokens: 4096, system: systemPrompt, messages, stream: true,
            }),
          });

          if (!r.ok || !r.body) {
            send({ type: "error", error: `Anthropic error: ${r.status}` });
            controller.close();
            return;
          }

          const reader = r.body.getReader();
          const decoder = new TextDecoder();
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
                if (event.type === "content_block_delta" && event.delta?.text) {
                  send({ type: "text", text: event.delta.text });
                }
              } catch { /* skip */ }
            }
          }
          send({ type: "done" });
          controller.close();
          return;
        }

        if (provider === "gemini") {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
          const contents = messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));
          const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents,
              ...(systemPrompt ? { systemInstruction: { parts: [{ text: systemPrompt }] } } : {}),
              generationConfig: { maxOutputTokens: 4096 },
            }),
          });
          if (!r.ok || !r.body) {
            send({ type: "error", error: `Gemini error: ${r.status}` });
            controller.close();
            return;
          }
          const reader = r.body.getReader();
          const decoder = new TextDecoder();
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
                const text = event.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) send({ type: "text", text });
              } catch { /* skip */ }
            }
          }
          send({ type: "done" });
          controller.close();
          return;
        }

        // OpenAI-compatible streaming
        const cfg = OPENAI_COMPAT[provider];
        if (!cfg) {
          send({ type: "error", error: `Unsupported: ${provider}` });
          controller.close();
          return;
        }

        const openaiMessages = systemPrompt
          ? [{ role: "system", content: systemPrompt }, ...messages]
          : messages;

        const r = await fetch(cfg.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            ...(cfg.extraHeaders || {}),
          },
          body: JSON.stringify({
            model, messages: openaiMessages, max_tokens: 4096, temperature: 0.7, stream: true,
          }),
        });

        if (!r.ok || !r.body) {
          const err = await r.text();
          send({ type: "error", error: `${provider} error: ${r.status} ${err.slice(0, 200)}` });
          controller.close();
          return;
        }

        const reader = r.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") {
              send({ type: "done" });
              controller.close();
              return;
            }
            try {
              const event = JSON.parse(data);
              const text = event.choices?.[0]?.delta?.content;
              if (text) send({ type: "text", text });
            } catch { /* skip */ }
          }
        }
        send({ type: "done" });
        controller.close();
      } catch (e: any) {
        send({ type: "error", error: e.message });
        controller.close();
      }
    },
  });
}
