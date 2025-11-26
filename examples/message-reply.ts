import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        console.log("Message reply example...\n");

        try {
            console.log("Sending first message...");
            const firstMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "What's your favorite color?",
            });

            console.log(`✓ First message sent! GUID: ${firstMessage.guid}`);
            console.log(`Text: "${firstMessage.text}"\n`);

            await new Promise((resolve) => setTimeout(resolve, 1000));

            console.log("Sending second message...");
            const secondMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Also, what's your favorite food?",
            });

            console.log(`✓ Second message sent! GUID: ${secondMessage.guid}`);
            console.log(`Text: "${secondMessage.text}"\n`);

            await new Promise((resolve) => setTimeout(resolve, 1000));

            console.log("Sending third message...");
            const thirdMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "And your favorite movie?",
            });

            console.log(`✓ Third message sent! GUID: ${thirdMessage.guid}`);
            console.log(`Text: "${thirdMessage.text}"\n`);

            await new Promise((resolve) => setTimeout(resolve, 2000));

            console.log("Sending reply to the FIRST message (even though we sent multiple messages)...");
            const replyMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "My favorite color is blue! 💙",
                selectedMessageGuid: firstMessage.guid,
            });

            console.log("\n✓ Reply sent successfully!");
            console.log(`Reply message GUID: ${replyMessage.guid}`);
            console.log(`Reply text: "${replyMessage.text}"`);
            console.log(`Replying to first message: ${firstMessage.guid.substring(0, 20)}...`);
            console.log(`First message text: "${firstMessage.text}"`);
        } catch (error) {
            handleError(error, "Failed to send reply");
        }

        await sdk.disconnect();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
