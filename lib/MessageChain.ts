import type { Message } from "../interfaces";
import type { AdvancedIMessageKit } from "../mobai";

/**
 * Message Processing Chain - Provides fluent chain API for message handling
 *
 * Must explicitly call execute() to perform operations
 *
 * @example
 * ```ts
 * await sdk.message(msg)
 *   .ifFromOthers()
 *   .matchText('hello')
 *   .replyText('Hi!')
 *   .execute()
 * ```
 */
export class MessageChain {
    /** Should execute */
    private shouldExecute = true;

    /** Queue of operations to execute */
    private actions: Array<() => Promise<void>> = [];

    /** Has been executed */
    private executed = false;

    /** Timeout for unexecuted chain detection */
    private timeoutId?: ReturnType<typeof setTimeout>;

    constructor(
        /** Message object */
        private readonly message: Message,
        /** SDK instance */
        private readonly sdk: AdvancedIMessageKit,
    ) {
        // In development mode, detect unexecuted chains
        if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
            this.timeoutId = setTimeout(() => {
                if (!this.executed && this.actions.length > 0) {
                    console.warn(
                        "[MessageChain] Warning: Detected unexecuted message chain.",
                        `Message GUID: ${this.message.guid}, From: ${this.message.handle?.address ?? "unknown"}`,
                        "Did you forget to call .execute()?",
                    );
                }
            }, 5000); // Increased to 5 seconds to reduce false positives
        }
    }

    /**
     * Conditional judgment
     */
    when(predicate: (message: Message) => boolean): this {
        if (this.shouldExecute) {
            this.shouldExecute = predicate(this.message);
        }
        return this;
    }

    /**
     * Match text pattern
     */
    matchText(pattern: string | RegExp): this {
        return this.when((m) => {
            if (!m.text) return false;
            return typeof pattern === "string" ? m.text.includes(pattern) : pattern.test(m.text);
        });
    }

    /**
     * Only handle messages from others
     */
    ifFromOthers(): this {
        return this.when((m) => !m.isFromMe);
    }

    /**
     * Only handle messages sent by me
     */
    ifFromMe(): this {
        return this.when((m) => m.isFromMe === true);
    }

    /**
     * Only handle group chat messages
     */
    ifGroupChat(): this {
        return this.when((m) => {
            if (!m.chats || m.chats.length === 0) return false;
            const chat = m.chats[0] as any;
            // Check if it's a group chat (more than 1 participant, or has isGroupChat flag)
            if (chat?.isGroupChat !== undefined) {
                return chat.isGroupChat;
            }
            // Fallback: consider it a group if more than 2 participants
            return !!(chat?.participants && chat.participants.length > 2);
        });
    }

    /**
     * Only handle direct messages (non-group)
     */
    ifDirectMessage(): this {
        return this.when((m) => {
            if (!m.chats || m.chats.length === 0) return false;
            const chat = m.chats[0] as any;
            // Check if it's NOT a group chat
            if (chat?.isGroupChat !== undefined) {
                return !chat.isGroupChat;
            }
            // Fallback: consider it direct if 2 or fewer participants
            return !chat?.participants || chat.participants.length <= 2;
        });
    }

    /**
     * Reply with text message
     *
     * Automatically routes to correct chat based on message's chatGuid
     */
    replyText(text: string | ((message: Message) => string)): this {
        // Early validation
        if (!this.message.chats || this.message.chats.length === 0 || !this.message.chats[0]?.guid) {
            console.warn(
                "[MessageChain] Warning: Message has no chat GUID. Reply will fail when executed.",
                `Message GUID: ${this.message.guid}`,
            );
        }

        if (this.shouldExecute) {
            this.actions.push(async () => {
                const replyText = typeof text === "function" ? text(this.message) : text;
                const chatGuid = this.message.chats?.[0]?.guid;

                if (!chatGuid) {
                    throw new Error("Unable to determine message's chat GUID");
                }

                await this.sdk.send(chatGuid, replyText);
            });
        }
        return this;
    }

    /**
     * Reply with image
     */
    replyImage(imagePath: string | string[] | ((message: Message) => string | string[])): this {
        // Early validation
        if (!this.message.chats || this.message.chats.length === 0 || !this.message.chats[0]?.guid) {
            console.warn(
                "[MessageChain] Warning: Message has no chat GUID. Reply will fail when executed.",
                `Message GUID: ${this.message.guid}`,
            );
        }

        if (this.shouldExecute) {
            this.actions.push(async () => {
                const imagePaths = typeof imagePath === "function" ? imagePath(this.message) : imagePath;
                const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
                const chatGuid = this.message.chats?.[0]?.guid;

                if (!chatGuid) {
                    throw new Error("Unable to determine message's chat GUID");
                }

                // Send image as attachment
                for (const path of paths) {
                    await this.sdk.sendFile(chatGuid, path);
                }
            });
        }
        return this;
    }

    /**
     * Reply with file
     */
    replyFile(filePath: string | string[] | ((message: Message) => string | string[])): this {
        // Early validation
        if (!this.message.chats || this.message.chats.length === 0 || !this.message.chats[0]?.guid) {
            console.warn(
                "[MessageChain] Warning: Message has no chat GUID. Reply will fail when executed.",
                `Message GUID: ${this.message.guid}`,
            );
        }

        if (this.shouldExecute) {
            this.actions.push(async () => {
                const filePaths = typeof filePath === "function" ? filePath(this.message) : filePath;
                const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
                const chatGuid = this.message.chats?.[0]?.guid;

                if (!chatGuid) {
                    throw new Error("Unable to determine message's chat GUID");
                }

                await this.sdk.sendFiles(chatGuid, paths);
            });
        }
        return this;
    }

    /**
     * Add reaction
     */
    react(reaction: string | ((message: Message) => string)): this {
        if (this.shouldExecute) {
            this.actions.push(async () => {
                const reactionText = typeof reaction === "function" ? reaction(this.message) : reaction;
                const chatGuid = this.message.chats?.[0]?.guid;

                if (!chatGuid || !this.message.guid) {
                    throw new Error("Unable to determine message's chat GUID or message GUID");
                }

                await this.sdk.reactToMessage(chatGuid, this.message.guid, reactionText);
            });
        }
        return this;
    }

    /**
     * Perform custom operation
     */
    do(handler: (message: Message) => void | Promise<void>): this {
        if (this.shouldExecute) {
            this.actions.push(async () => {
                await Promise.resolve(handler(this.message));
            });
        }
        return this;
    }

    /**
     * Execute all operations
     */
    async execute(): Promise<void> {
        this.executed = true;

        // Clear timeout if exists
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }

        // If should not execute or no operations, return directly
        if (!this.shouldExecute || this.actions.length === 0) {
            return;
        }

        // Execute all operations sequentially
        for (const action of this.actions) {
            await action();
        }
    }
}
