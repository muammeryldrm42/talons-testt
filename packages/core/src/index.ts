// ============================================================
// 🦅 @open-talons/core (v2.6)
// ============================================================

export * from "./types";
export * from "./providers";
export { PluginRegistry } from "./plugins/registry";
export { SkillRegistry } from "./skills/registry";
export { CommandRegistry } from "./commands/registry";
export { PermissionManager } from "./permissions/manager";
export { MemoryManager } from "./memory";
export { Task } from "./runtime/task";
export { Talons, createTalons } from "./runtime/talons";
export type { TalonsOptions } from "./runtime/talons";
export { ConversationManager } from "./runtime/conversations";
export type { Conversation } from "./runtime/conversations";
export { Orchestrator } from "./orchestrator";
export type { DelegationContext, OrchestratorOptions } from "./orchestrator";
export {
  streamLLM, streamAnthropic, streamOpenAICompat, streamGemini, streamOllama,
} from "./streaming";
export type { StreamChunk, StreamRequest } from "./streaming";
export { MCPClient, MCPManager } from "./mcp";
export type { MCPServerConfig, MCPTool } from "./mcp";
export { routeKeyword, routeLLM, smartRoute } from "./routing";
export type { RoutingResult } from "./routing";
export { LRUCache, RequestBatcher, toolCache, globalBatcher, toolCacheKey, CACHE_TTL } from "./cache";
export type { CacheEntry, CacheStats } from "./cache";
