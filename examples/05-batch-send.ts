/**
 * 示例 5: 批量发送消息
 *
 * 演示如何使用批量发送 API
 */

import { AdvancedIMessageKit } from "../index";

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    await sdk.connect();

    try {
        // 批量发送消息
        const results = await sdk.sendBatch([
            { chatGuid: "chat1", content: "Hello from batch 1" },
            { chatGuid: "chat2", content: "Hello from batch 2" },
            {
                chatGuid: "chat3",
                content: {
                    text: "Special message",
                    effectId: "com.apple.messages.effect.Confetti",
                },
            },
        ]);

        // 处理结果
        console.log("\n批量发送结果:");
        for (const result of results) {
            if (result.success) {
                console.log(`✓ ${result.chatGuid}: 发送成功`);
            } else {
                console.error(`✗ ${result.chatGuid}: 发送失败 - ${result.error?.message}`);
            }
        }

        // 统计
        const successCount = results.filter((r) => r.success).length;
        const failCount = results.filter((r) => !r.success).length;
        console.log(`\n总计: ${successCount} 成功, ${failCount} 失败`);
    } catch (error) {
        console.error("批量发送失败:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
