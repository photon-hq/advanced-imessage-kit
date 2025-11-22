/**
 * Simple console-based logger plugin.
 *
 * Ported from imessage-kit-main/src/plugins/logger.ts and adapted to the
 * Advanced iMessage Kit plugin system.
 */

import type { Plugin } from "./core";
import { definePlugin } from "./core";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LoggerOptions {
    level?: LogLevel;
    colored?: boolean;
    timestamp?: boolean;
    logSend?: boolean;
    logNewMessage?: boolean;
}

const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const COLORS: Record<LogLevel, string> = {
    debug: "\x1b[36m",
    info: "\x1b[32m",
    warn: "\x1b[33m",
    error: "\x1b[31m",
};

const RESET = "\x1b[0m";

export const loggerPlugin = (options: LoggerOptions = {}): Plugin => {
    const { level = "info", colored = true, timestamp = false, logSend = true, logNewMessage = false } = options;

    const log = (logLevel: LogLevel, message: string, data?: unknown) => {
        if (LEVELS[logLevel] < LEVELS[level]) return;

        const time = timestamp ? new Date().toLocaleTimeString("en-US") : "";
        const tag = logLevel.toUpperCase().padEnd(5);
        const color = colored ? COLORS[logLevel] : "";
        const reset = colored ? RESET : "";

        const prefix = time ? `${time} ${color}[${tag}]${reset}` : `${color}[${tag}]${reset}`;
        const output = data ? `${prefix} ${message} ${JSON.stringify(data)}` : `${prefix} ${message}`;

        // eslint-disable-next-line no-console
        console.log(output);
    };

    return definePlugin({
        name: "logger",
        version: "1.0.0",
        description: "Advanced iMessage Kit logger plugin",

        onInit: () => {
            log("info", "SDK initialized");
        },

        onBeforeSend: (to, content) => {
            if (!logSend) return;

            const preview = content.text?.substring(0, 30) || "(no text)";
            const attachCount = content.attachments?.length || 0;
            const attachInfo = attachCount ? ` + ${attachCount} attachment(s)` : "";

            log("info", `[SEND] Sending to ${to}: ${preview}${attachInfo}`);
        },

        onAfterSend: (to) => {
            if (logSend) {
                log("info", `[OK] Sent successfully -> ${to}`);
            }
        },

        onNewMessage: (message) => {
            if (!logNewMessage) return;

            const preview = message.text?.substring(0, 40) || "(no text)";
            const attachCount = Array.isArray(message.attachments) ? message.attachments.length : 0;
            const attachInfo = attachCount ? ` [${attachCount}]` : "";
            const sender = message.handle?.address ?? "(unknown)";

            log("info", `[MSG] New message from ${sender}: ${preview}${attachInfo}`);
        },

        onError: (error, context) => {
            const contextInfo = context || "Error";
            log("error", `[ERROR] ${contextInfo}: ${error.message}`);
        },

        onDestroy: () => {
            log("info", "[CLOSE] SDK destroyed");
        },
    });
};
