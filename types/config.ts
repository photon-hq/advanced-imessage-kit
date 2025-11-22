import type { Plugin } from "../plugins/core";

/**
 * Public configuration object used when constructing an `IMessageSDK` instance.
 *
 * This closely mirrors the `IMessageConfig` from imessage-kit-main, but is
 * tailored for the Advanced iMessage Kit server.
 */
export interface IMessageConfig {
    /**
     * HTTPS URL of your Advanced iMessage Kit server, for example:
     * "https://your-subdomain.imsgd.photon.codes".
     */
    readonly serverUrl: string;

    /**
     * Minimum log level for internal logging. Defaults to "info".
     */
    readonly logLevel?: "debug" | "info" | "warn" | "error";

    /**
     * Optional API key used when the server is protected by a nexus control
     * plane. See the README section on `apiKey` and nexus auth for details.
     */
    readonly apiKey?: string;

    /**
     * Optional plugin list applied to this SDK instance. Use `definePlugin`
     * from `./plugins/core` to author strongly-typed plugins.
     */
    readonly plugins?: readonly Plugin[];

    /**
     * Additional watcher-related configuration.
     */
    readonly watcher?: {
        /**
         * When true (default), watcher callbacks ignore messages sent by the
         * local user (`message.isFromMe === true`).
         */
        readonly excludeOwnMessages?: boolean;
    };
}

/**
 * Fully-resolved configuration used internally by `IMessageSDK`.
 */
export interface ResolvedConfig {
    readonly serverUrl: string;
    readonly logLevel: "debug" | "info" | "warn" | "error";
    readonly apiKey?: string;
    readonly plugins: readonly Plugin[];
    readonly watcher: {
        readonly excludeOwnMessages: boolean;
    };
}
