import { SDK } from "../index";

async function autoReplyHeyTest() {
    console.log("🤖 自动回复测试 - 收到消息后回复 \"Hey！\" + 原消息");
    console.log("服务器: https://u1.imsgd.photon.codes");
    console.log("=".repeat(50));

    const sdk = SDK({
        serverUrl: "https://u1.imsgd.photon.codes",
        logLevel: "info",
    });

    // 注册事件监听器
    sdk.on("connect", () => {
        console.log("✅ [SDK] Socket.IO 连接成功");
    });

    sdk.on("disconnect", () => {
        console.log("❌ [SDK] Socket.IO 断开连接");
    });

    sdk.on("error", (error: any) => {
        console.log("🚨 [SDK] 错误:", error);
    });

    sdk.on("ready", () => {
        console.log("✅ SDK就绪，自动回复功能已启动！");
    });

    sdk.on("new-message", async (message: any) => {
        console.log("📨 收到新消息:");
        console.log("  发送者:", message.handle?.address || "Unknown");
        console.log("  内容:", message.text || message.attributedBody || "No text");
        console.log("  GUID:", message.guid);
        console.log("  来自我:", message.isFromMe);

        // 如果消息不是来自我自己，则自动回复
        if (!message.isFromMe && message.chats && message.chats.length > 0) {
            const chatGuid = message.chats[0].guid;
            console.log("🤖 准备自动回复到聊天:", chatGuid);

            try {
                // 获取原始消息内容
                const originalMessage =
                    message.text || message.attributedBody?.[0]?.string || "No text";

                // 发送自动回复：Hey！ + 原始消息
                const replyMessage = `Hey！${originalMessage}`;

                const response = await sdk.messages.sendMessage({
                    chatGuid: chatGuid,
                    message: replyMessage,
                });

                console.log("✅ 自动回复发送成功:", response);
            } catch (error) {
                console.error("❌ 自动回复发送失败:", error);
            }
        } else if (message.isFromMe) {
            console.log("⏭️  跳过自己发送的消息");
        }
    });

    console.log("🚀 开始连接...");
    await sdk.connect();

    // 保持连接
    process.on("SIGINT", () => {
        console.log("\n👋 正在断开连接...");
        console.log(`📊 已处理消息数量: ${sdk.getProcessedMessageCount()}`);
        sdk.disconnect();
        process.exit(0);
    });
}

autoReplyHeyTest().catch(console.error);