# CLAUDE.md — Advanced iMessage Kit

## Project overview

This repository contains `@photon-ai/advanced-imessage-kit`, a TypeScript SDK for interacting with an Advanced iMessage Kit server running on macOS.

The SDK connects to the server over Socket.IO and exposes a high-level `IMessageSDK` class for:

- Reading, sending, and automating iMessage conversations
- Managing chats, participants, and group icons
- Working with attachments, stickers, and voice messages
- Scheduled messages, analytics, and basic server metadata

The server is responsible for talking to macOS (including any Private API or AppleScript logic). This SDK is a **pure client** and must remain platform‑agnostic.

---

## Repository layout (high level)

- `sdk.ts`
  - Main public entrypoint: `IMessageSDK` and `MessageChain`
  - Wraps the internal `RemoteClient` and exposes a flat API surface (`sdk.send`, `sdk.getMessages`, `sdk.createChat`, etc.)
- `remoteClient.ts`
  - Low-level Socket.IO client
  - Manages connection, authentication, event subscriptions, and message de‑duplication
- `modules/`
  - Domain-specific client modules used by `RemoteClient`:
    - `attachment.ts` — get/download/send attachments & stickers
    - `chat.ts` — chat CRUD, group management, typing indicators, icons
    - `contact.ts` — contacts and contact cards
    - `facetime.ts` — create FaceTime links
    - `handle.ts` — handle lookups and availability
    - `icloud.ts` — Find My Friends–related calls
    - `message.ts` — send/edit/unsend/query messages, reactions
    - `scheduled.ts` — scheduled send helpers
    - `server.ts` — server metadata, logs, alerts, media statistics
- `types/`
  - Shared type definitions used across the SDK
  - Includes `SocketEventMap`, domain models, and SDK helper types
- `events.ts`
  - String constants for server‑emitted events (e.g. `NEW_MESSAGE`)
- `effects.ts`
  - Message effect IDs and their type aliases
- `lib/`
  - Logging utilities (`Logger`, `Loggable`, `getLogger`, `setGlobalLogLevel`)
- `plugins/`
  - Lightweight plugin system (`PluginManager`) and a built‑in `loggerPlugin`
- `dist/`
  - Build output from TypeScript; **do not edit**

When in doubt, treat `sdk.ts` + `types/` + `README.md` as the source of truth for the public API.

---

## Coding & design guidelines

### General

- Use **TypeScript** for all source changes.
- Target **Node.js ≥ 18** (see `package.json` `engines` field).
- Do **not** edit `dist/` directly; always modify `*.ts` sources and rebuild.
- Keep the public surface of `IMessageSDK` stable. If you must change it, update:
  - Types in `types/`
  - Wrappers in `sdk.ts`
  - Examples and capability tables in `README.md`

### Socket / API design

- `SocketEventMap` in `types/socketEvents.ts` is the contract between this SDK and the server.
  - When adding a new capability, first extend `SocketEventMap`.
  - Then add a domain method in the corresponding `modules/*.ts` file.
  - Finally expose a high‑level wrapper method in `IMessageSDK`.
- Prefer **narrow, well‑named methods** over over‑loaded “do everything” helpers.
- Always keep parameter names and shapes aligned with the server’s socket routes.

### Message sending semantics

This client assumes the server is responsible for selecting the implementation details (e.g. Private API vs AppleScript). For this SDK:

- Do **not** introduce client‑side flags like `method: "apple-script" | "private-api"` on send/create APIs.
- Keep high‑level helpers (`send`, `sendMessage`, `createChat`, scheduled messages) semantically **Private‑API‑only** from the client’s perspective.
- If the server changes its internal implementation, reflect that only at the socket contract level, not with new client‑side transport flags.

---

## How to modify or extend the SDK

### Adding support for a new socket event

1. **Types**
   - Extend `SocketEventMap` in `types/socketEvents.ts` with the new event key, `req`, and `res` types.
   - Add or reuse domain model types under `types/` as needed.
2. **Module method**
   - Implement a method in the appropriate `modules/*.ts` file.
   - Call `this.sdk.request("event-name", payload)` with a strongly typed payload.
3. **Public wrapper**
   - Add a corresponding method to `IMessageSDK` in `sdk.ts`.
   - Delegate to the `RemoteClient` module (e.g. `this.client.messages.<method>()`).
4. **Docs**
   - Add a short example to `README.md` in the relevant section.
   - Optionally update any capability tables to include the new method.

### Changing existing behavior

- For **breaking changes** to event payloads or response shapes:
  - Update `SocketEventMap` first.
  - Refactor the corresponding module and any `IMessageSDK` wrappers.
  - Update README examples to match the new behavior.
- For **non‑breaking** tweaks (e.g. optional fields):
  - Prefer backwards‑compatible changes to type definitions.

---

## Tooling and commands

Use `bun` for local workflows (see `package.json` scripts):

- Format: `bun run format`
- Lint: `bun run lint`
- Type‑check: `bun run type-check`
- Build: `bun run build`

The `prepublishOnly` script runs **format → lint → type‑check → build** before publishing.
There is currently no dedicated automated test suite in this repo.

---

## How Claude should work in this repo

When acting as a coding assistant for this repository:

- **Prefer small, focused changes** tied to a specific feature or bug.
- **Never edit `dist/` or `node_modules/`**; only touch TypeScript source files, docs, or config.
- When changing public APIs in `IMessageSDK`:
  - Keep type definitions and README examples in sync.
  - Consider backwards compatibility for existing consumers.
- When interacting with the server:
  - Remember this package is a **client SDK**. Do not embed macOS‑specific logic here.
  - Treat socket event contracts as coming from `advanced-imessage-kit-server`.
- For documentation improvements:
  - Prefer updating `README.md` sections that already exist (Quick Start, Core API, Capability Matrix).
  - Keep examples realistic and aligned with the actual TypeScript signatures.

If a task appears to require server‑side changes, clearly flag that those belong in the `advanced-imessage-kit-server` repository, not here.
