/**
 * Core plugin contracts and runtime helpers.
 *
 * Ported from imessage-kit-main/src/plugins/core.ts.
 */

import type { SendResult } from "../types/sdk";
import type { Message } from "../types/message";

/**
 * Lifecycle hooks that a plugin can implement.
 */
export interface PluginHooks {
    /** Called once when the SDK has been initialized. */
    onInit?: () => void | Promise<void>;

    /** Called before a query-like operation (getMessages, listChats, etc.). */
    onBeforeQuery?: (filter: unknown) => void | Promise<void>;

    /** Called after messages have been loaded for a query. */
    onAfterQuery?: (messages: readonly Message[]) => void | Promise<void>;

    /** Called before a message is sent (high-level send API). */
    onBeforeSend?: (to: string, content: { text?: string; attachments?: string[] }) => void | Promise<void>;

    /** Called after a message has been sent successfully. */
    onAfterSend?: (to: string, result: SendResult) => void | Promise<void>;

    /** Called when a new message is received by a watcher or socket event. */
    onNewMessage?: (message: Message) => void | Promise<void>;

    /** Called when another hook or SDK logic reports an error. */
    onError?: (error: Error, context?: string) => void | Promise<void>;

    /** Called when the SDK is being destroyed and plugins should clean up. */
    onDestroy?: () => void | Promise<void>;
}

/** Static metadata that describes a plugin. */
export interface PluginMetadata {
    /** Unique plugin name. */
    readonly name: string;
    /** Optional semantic version of the plugin. */
    readonly version?: string;
    /** Optional human-readable description. */
    readonly description?: string;
}

/** A concrete plugin = metadata + hooks. */
export interface Plugin extends PluginMetadata, PluginHooks { }

/** Manages plugin registration and hook dispatching. */
export class PluginManager {
    /** Registered plugins. */
    private plugins: Plugin[] = [];

    /** Whether onInit has been called for existing plugins. */
    initialized = false;

    /** Register a new plugin. If already initialized, call its onInit immediately. */
    use(plugin: Plugin): this {
        this.plugins.push(plugin);

        if (this.initialized && plugin.onInit) {
            Promise.resolve(plugin.onInit()).catch((error) => {
                const errorMsg = `[Plugin ${plugin.name}] Initialization failed:`;
                // eslint-disable-next-line no-console
                console.error(errorMsg, error);
            });
        }

        return this;
    }

    /** Initialize all plugins by invoking their onInit hooks. */
    async init(): Promise<void> {
        this.initialized = true;
        await this.callHookForAll("onInit");
    }

    /** Tear down all plugins by invoking their onDestroy hooks. */
    async destroy(): Promise<void> {
        await this.callHookForAll("onDestroy");
        this.plugins = [];
        this.initialized = false;
    }

    /**
     * Call a given hook on all registered plugins.
     *
     * @param hookName Name of the hook to call.
     * @param args Arguments passed through to the hook.
     * @returns A list of plugins that failed along with their errors.
     */
    async callHookForAll<K extends keyof PluginHooks>(
        hookName: K,
        ...args: Parameters<NonNullable<PluginHooks[K]>>
    ): Promise<Array<{ plugin: string; error: Error }>> {
        const pluginsWithHook = this.plugins.filter((p) => p[hookName]);

        if (pluginsWithHook.length === 0) {
            return [];
        }

        const results = await Promise.allSettled(
            pluginsWithHook.map(async (plugin) => {
                try {
                    const hook = plugin[hookName]!;
                    const hookFn = hook as (...a: typeof args) => void | Promise<void>;
                    await Promise.resolve(hookFn(...args));

                    return {
                        plugin: plugin.name,
                        success: true as const,
                    };
                } catch (error) {
                    const normalizedError = error instanceof Error ? error : new Error(String(error));

                    return {
                        plugin: plugin.name,
                        success: false as const,
                        error: normalizedError,
                    };
                }
            }),
        );

        const errors: Array<{ plugin: string; error: Error }> = [];

        for (const result of results) {
            if (result.status === "fulfilled" && !result.value.success) {
                errors.push({
                    plugin: result.value.plugin,
                    error: result.value.error!,
                });
            } else if (result.status === "rejected") {
                const normalizedError =
                    result.reason instanceof Error ? result.reason : new Error(String(result.reason));

                errors.push({
                    plugin: "unknown",
                    error: normalizedError,
                });
            }
        }

        // If there are errors and this is not the onError hook, log them and notify onError.
        if (errors.length > 0 && hookName !== "onError") {
            for (const { plugin, error } of errors) {
                // eslint-disable-next-line no-console
                console.error(`[Plugin ${plugin}] ${String(hookName)} failed:`, error);

                try {
                    const context = `Plugin ${plugin} - ${String(hookName)}`;
                    await this.callHookForAll("onError", error, context);
                } catch {
                    // Swallow errors from onError handlers to avoid infinite loops.
                }
            }
        }

        return errors;
    }
}

/** Helper to get proper type inference when authoring a plugin. */
export const definePlugin = (plugin: Plugin) => plugin;
