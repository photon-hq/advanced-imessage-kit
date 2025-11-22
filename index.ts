import "reflect-metadata";

// Core Socket.IO event constants and names.
export * from "./events";

// Fundamental iMessage entities.
export type { Chat, Handle, Message } from "./interfaces";

// Logger utilities and global log-level helpers.
export { getLogger, setGlobalLogLevel } from "./lib/Loggable";

// Primary SDK surface compatible with the main iMessage kit.
export { IMessageSDK, MessageChain } from "./sdk";

// Public configuration and high-level result types.
export type { IMessageConfig, ResolvedConfig } from "./types/config";
export type { SendResult } from "./types/sdk";

// Plugin authoring helpers and built-in logger plugin.
export { definePlugin, type Plugin, type PluginHooks } from "./plugins/core";
export { loggerPlugin, type LoggerOptions } from "./plugins/logger";

// Re-export additional domain-specific types.
export * from "./types";

// Predefined iMessage effect identifiers and their type aliases.
export { MESSAGE_EFFECTS } from "./effects";
export type { MessageEffectId, MessageEffectKey } from "./effects";
