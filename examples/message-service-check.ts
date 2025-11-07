import type { Message } from "../interfaces";
import { createSDK, handleExit } from "./utils";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", () => {
        console.log("Monitoring messages for service type\n");
    });

    sdk.on("new-message", (message: Message) => {
        if (message.isFromMe) return;

        const service = message.service || message.chats?.[0]?.guid?.split(";")[0] || "Unknown";
        const isIMessage = service === "iMessage";
        const icon = isIMessage ? "💙" : service === "SMS" ? "💚" : "❓";

        console.log(`${icon} ${service} | ${message.handle?.address || "Unknown"} | ${message.text || "(no text)"}`);
    });

    await sdk.connect();
    handleExit(sdk);
}

main().catch(console.error);
