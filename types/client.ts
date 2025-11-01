export interface ClientConfig {
    serverUrl?: string;
    logLevel?: "debug" | "info" | "warn" | "error";
    /**
     * Connection mode: "socket.io" (default) or "websocket" (for imsgd)
     */
    connectionMode?: "socket.io" | "websocket";
    /**
     * WebSocket UUID (required when connectionMode is "websocket")
     * Example: "248dc8c3-30d6-45b0-b2e7-070fe171a2b8"
     */
    websocketUUID?: string;
}
