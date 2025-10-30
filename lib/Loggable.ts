import { EventEmitter as EventEmitterClass } from "node:events";
import type { LogLevel } from "./Logger";
import { Logger } from "./Logger";

const loggers: Record<string, Logger> = {};
let globalLogLevel: LogLevel = "info";

export const setGlobalLogLevel = (level: LogLevel) => {
    globalLogLevel = level;
    Object.values(loggers).forEach((logger) => {
        logger.setLogLevel(level);
    });
};

export const getLogger = (tag: string) => {
    let logger = loggers[tag];
    if (!logger) {
        logger = new Logger(tag, globalLogLevel);
        loggers[tag] = logger;
    }

    return logger;
};

export class Loggable extends EventEmitterClass {
    tag?: string;

    get log() {
        const name = this.tag ?? this.constructor.name;
        return getLogger(name);
    }

    constructor(tag?: string) {
        super();

        if (tag) {
            this.tag = tag;
        }
    }

    onLog(listener: (data: { level: string; message: string; tag: string }) => void) {
        this.log.on("log", listener);
    }
}
