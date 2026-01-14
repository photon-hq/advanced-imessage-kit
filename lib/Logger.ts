import EventEmitter from "node:events";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

export type LogLevel = "debug" | "info" | "warn" | "error";

export class Logger extends EventEmitter {
    tag: string;
    private logLevel: LogLevel = "info";
    private logFile?: string;

    constructor(tag: string, level: LogLevel = "info", logToFile = true) {
        super();
        this.tag = tag;
        this.logLevel = level;

        if (logToFile) {
            try {
                const logDir = path.join(os.homedir(), "Library", "Logs", "AdvancedIMessageKit");
                if (!fs.existsSync(logDir)) {
                    fs.mkdirSync(logDir, { recursive: true });
                }
                this.logFile = path.join(logDir, "sdk.log");
            } catch {
                // Silently disable file logging if directory creation fails
                // (e.g., read-only filesystem)
            }
        }
    }

    setLogLevel(level: LogLevel) {
        this.logLevel = level;
    }

    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ["debug", "info", "warn", "error"];
        const currentIndex = levels.indexOf(this.logLevel);
        const messageIndex = levels.indexOf(level);
        return messageIndex >= currentIndex;
    }

    private formatMessage(level: string, message: string): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}][${level.toUpperCase()}][${this.tag}] ${message}`;
    }

    private writeLog(level: LogLevel, message: string) {
        if (!this.shouldLog(level)) return;

        const formatted = this.formatMessage(level, message);

        switch (level) {
            case "error":
                console.error(formatted);
                break;
            case "warn":
                console.warn(formatted);
                break;
            case "debug":
                console.debug(formatted);
                break;
            default:
                console.log(formatted);
        }

        if (this.logFile) {
            try {
                fs.appendFileSync(this.logFile, `${formatted}\n`);
            } catch {}
        }

        this.emit("log", { level, message, tag: this.tag });
    }

    info(message: string) {
        this.writeLog("info", message);
    }

    debug(message: string) {
        this.writeLog("debug", message);
    }

    error(message: string | Error) {
        const msg = message instanceof Error ? message.message : message;
        this.writeLog("error", msg);
        if (message instanceof Error && message.stack) {
            this.writeLog("error", message.stack);
        }
    }

    warn(message: string) {
        this.writeLog("warn", message);
    }

    log(message: string, level: LogLevel = "info") {
        this.writeLog(level, message);
    }
}
