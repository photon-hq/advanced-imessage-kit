<div align="center">

![Banner](./.github/assets/banner.png)

# Advanced iMessage Kit

> Powerful TypeScript iMessage SDK with real-time message processing

</div>

[![TypeScript](https://img.shields.io/badge/TypeScript-^5-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Discord](https://img.shields.io/badge/Discord-Join-5865F2.svg?logo=discord&logoColor=white)](https://discord.gg/RSJUUHTV)

Advanced iMessage Kit is a comprehensive iMessage SDK for **reading**, **sending**, and **automating** iMessage conversations on macOS. Designed for building **AI agents**, **automation tools**, and **chat applications**.

## Features

- **Type Safe** — Complete TypeScript support with full type definitions
- **Real-time Communication** — WebSocket-based event system for instant message updates
- **Complete API** — Send text, attachments, reactions, edit messages, and more
- **Group Management** — Create groups, manage members, and set group icons
- **Rich Attachments** — Send images, files, voice messages, stickers, and contact cards
- **Advanced Querying** — Powerful message filtering and search capabilities
- **Analytics** — Track message counts, delivery status, and chat statistics
- **Event-driven** — Listen for new messages, typing indicators, and status changes

## Quick Start

### Installation

```bash
npm install @photon-ai/advanced-imessage-kit
# or
bun add @photon-ai/advanced-imessage-kit
```

### Basic Usage

```typescript
import { SDK } from "@photon-ai/advanced-imessage-kit";

const sdk = SDK({
  serverUrl: "{your-subdomain}.imsgd.photon.codes", // Your subdomain is the unique link address assigned to you
});

// Connect to the server
await sdk.connect();

// Listen for new messages
sdk.on("new-message", (message) => {
  console.log("New message:", message.text);
});

// Send a message
await sdk.messages.sendMessage({
  chatGuid: "any;-;+1234567890",
  message: "Hello World!",
});

// Disconnect when done
await sdk.close();
```

## Core API

### Initialization & Connection

```typescript
import { SDK } from "@photon-ai/advanced-imessage-kit";

const sdk = SDK({
  serverUrl: "{your-subdomain}.imsgd.photon.codes", // Your subdomain is the unique link address assigned to you
  logLevel: "info", // Log level: 'debug' | 'info' | 'warn' | 'error'
});

// Connect to server
await sdk.connect();

// Check connection status
sdk.on("ready", () => {
  console.log("SDK is ready!");
});

// Graceful disconnect
await sdk.close();
```

### Connection Management

```typescript
// Message deduplication (prevents duplicate processing)
sdk.clearProcessedMessages(1000); // Clear old processed message records
const count = sdk.getProcessedMessageCount(); // Get processed message count
```

## Message Operations

### Sending Messages

```typescript
// Send text message
const message = await sdk.messages.sendMessage({
  chatGuid: "any;-;+1234567890",
  message: "Hello World!",
});

// Send message with options
await sdk.messages.sendMessage({
  chatGuid: "any;-;+1234567890",
  message: "Important message",
  subject: "Subject line",
  effectId: "com.apple.messages.effect.CKConfettiEffect",
});

// Reply to message
await sdk.messages.sendMessage({
  chatGuid: "any;-;+1234567890",
  message: "This is a reply",
  selectedMessageGuid: "original-message-guid",
});
```

### Message Querying

```typescript
// Get messages with filters
const messages = await sdk.messages.getMessages({
  chatGuid: "any;-;+1234567890",
  limit: 50,
  offset: 0,
});

// Get message counts
const totalCount = await sdk.messages.getMessageCount({
  chatGuid: "any;-;+1234567890",
  after: 1640995200000, // Timestamp
  before: 1641081600000, // Timestamp
});

const sentCount = await sdk.messages.getSentMessageCount();
```

### Message Actions

```typescript
// Edit message
await sdk.messages.editMessage({
  messageGuid: "message-guid",
  editedMessage: "Updated text",
  backwardsCompatibilityMessage: "Updated text",
});

// Add reaction
await sdk.messages.sendReaction({
  chatGuid: "any;-;+1234567890",
  messageGuid: "message-guid",
  reaction: "love", // Options: love, like, dislike, laugh, emphasize, question, -love, -like, etc.
  partIndex: 0, // Optional: defaults to 0
});

// Unsend message
await sdk.messages.unsendMessage({
  messageGuid: "message-guid",
});
```

## Chat Management

### Chat Operations

```typescript
// Get all chats
const chats = await sdk.chats.getChats();

// Get specific chat
const chat = await sdk.chats.getChat("chat-guid", {
  with: ["participants", "lastMessage"],
});

// Create new chat
const newChat = await sdk.chats.createChat({
  addresses: ["+1234567890", "+0987654321"],
  message: "Hello everyone!",
  service: "iMessage", // 'iMessage' or 'SMS'
  method: "private-api", // 'apple-script' or 'private-api'
});
```

### Group Management

```typescript
// Update group name
await sdk.chats.updateChat("chat-guid", {
  displayName: "My Group Chat",
});

// Add participant
await sdk.chats.addParticipant("chat-guid", "+1234567890");

// Remove participant
await sdk.chats.removeParticipant("chat-guid", "+1234567890");

// Leave group
await sdk.chats.leaveChat("chat-guid");
```

### Group Icons

```typescript
// Set group icon
await sdk.chats.setGroupIcon("chat-guid", "/path/to/image.jpg");

// Get group icon
const iconBuffer = await sdk.chats.getGroupIcon("chat-guid");

// Remove group icon
await sdk.chats.removeGroupIcon("chat-guid");
```

### Chat Status

```typescript
// Mark as read
await sdk.chats.markChatRead("chat-guid");

// Typing indicators
await sdk.chats.startTyping("chat-guid");
await sdk.chats.stopTyping("chat-guid");

// Get chat messages
const messages = await sdk.chats.getChatMessages("chat-guid", {
  limit: 100,
  offset: 0,
  sort: "DESC",
});
```

## Attachments & Media

### Sending Attachments

```typescript
// Send file attachment
const message = await sdk.attachments.sendAttachment({
  chatGuid: "any;-;+1234567890",
  filePath: "/path/to/file.jpg",
  fileName: "custom-name.jpg", // Optional
});

// Send sticker
await sdk.attachments.sendSticker({
  chatGuid: "any;-;+1234567890",
  filePath: "/path/to/sticker.png",
  selectedMessageGuid: "message-to-reply-to", // Optional
});
```

### Voice Messages

Voice messages differ from regular audio attachments. Ensure the audio file path exists and use common formats like `.m4a` or `.mp3`. In the example script, you can also supply the path via the `AUDIO_FILE_PATH` environment variable.

```typescript
// Send voice message
const message = await sdk.attachments.sendAttachment({
  chatGuid: "any;-;+1234567890",
  filePath: "/path/to/audio.mp3",
  isAudioMessage: true,
});

// Detect and handle incoming audio messages
sdk.on("new-message", async (msg) => {
  if (msg.isAudioMessage) {
    const att = msg.attachments?.[0];
    if (att) {
      // Download original audio attachment
      const audioBuffer = await sdk.attachments.downloadAttachment(att.guid, {
        original: true,
      });
      // Save or process audioBuffer
    }
  }
});
```

### Attachment Info

```typescript
// Get attachment details
const attachment = await sdk.attachments.getAttachment("attachment-guid");

// Get attachment count
const count = await sdk.attachments.getAttachmentCount();
```

## Contacts & Handles

### Contact Management

```typescript
// Get all contacts
const contacts = await sdk.contacts.getContacts();

// Get contact card
const contactCard = await sdk.contacts.getContactCard("+1234567890");

// Share contact card
await sdk.contacts.shareContactCard("chat-guid");

// Check if should share contact
const shouldShare = await sdk.contacts.shouldShareContact("chat-guid");
```

### Handle Operations

```typescript
// Query handles
const result = await sdk.handles.queryHandles({
  address: "+1234567890",
  with: ["chats"],
  limit: 50,
});

// Get handle availability
const isAvailable = await sdk.handles.getHandleAvailability(
  "handle-guid",
  "imessage"
);

// Get focus status
const focusStatus = await sdk.handles.getHandleFocusStatus("handle-guid");
```

## Real-time Events

The SDK emits various events for real-time updates. All events can be listened to using the `on()` method.

### Core Events

#### `ready`

Emitted when the SDK is fully connected and ready to use.

```typescript
sdk.on("ready", () => {
  console.log("SDK connected and ready");
});
```

#### `connect`

Emitted when Socket.IO connection is established.

```typescript
sdk.on("connect", () => {
  console.log("Socket.IO connected");
});
```

#### `disconnect`

Emitted when Socket.IO connection is lost.

```typescript
sdk.on("disconnect", () => {
  console.log("Socket.IO disconnected");
});
```

#### `error`

Emitted when an error occurs.

```typescript
sdk.on("error", (error) => {
  console.error("SDK error:", error);
});
```

### Message Events

#### `new-message`

Emitted when a new message is received or sent.

```typescript
sdk.on("new-message", (message) => {
  console.log("New message received:", message.text);
  console.log("From:", message.handle?.address);
  console.log("GUID:", message.guid);
});
```

#### `updated-message` / `message-updated`

Emitted when a message status changes (delivered, read, etc.).

```typescript
sdk.on("updated-message", (message) => {
  const status = message.dateRead
    ? "read"
    : message.dateDelivered
    ? "delivered"
    : "sent";
  console.log(`Message ${message.guid} is now ${status}`);
});
```

#### `message-send-error`

Emitted when sending a message fails.

```typescript
sdk.on("message-send-error", (data) => {
  console.error("Failed to send message:", data);
});
```

### Chat Events

#### `chat-read-status-changed`

Emitted when a chat is marked as read.

```typescript
sdk.on("chat-read-status-changed", ({ chatGuid, read }) => {
  console.log(`Chat ${chatGuid} marked as read`);
});
```

### Group Chat Events

#### `group-name-change`

Emitted when a group chat name is changed.

```typescript
sdk.on("group-name-change", (data) => {
  console.log(`Group renamed to: ${data.message.groupTitle}`);
});
```

#### `participant-added`

Emitted when someone is added to a group chat.

```typescript
sdk.on("participant-added", (data) => {
  console.log(`Participant added to ${data.chat.displayName}`);
});
```

#### `participant-removed`

Emitted when someone is removed from a group chat.

```typescript
sdk.on("participant-removed", (data) => {
  console.log(`Participant removed from ${data.chat.displayName}`);
});
```

#### `participant-left`

Emitted when someone leaves a group chat.

```typescript
sdk.on("participant-left", (data) => {
  console.log(`Participant left ${data.chat.displayName}`);
});
```

#### `group-icon-changed`

Emitted when a group chat icon is changed.

```typescript
sdk.on("group-icon-changed", (data) => {
  console.log("Group icon changed");
});
```

#### `group-icon-removed`

Emitted when a group chat icon is removed.

```typescript
sdk.on("group-icon-removed", (data) => {
  console.log("Group icon removed");
});
```

### Private API Events

#### `typing-indicator`

Emitted when someone is typing. Requires Private API.

```typescript
sdk.on("typing-indicator", (data) => {
  console.log("Typing status changed:", data);
});
```

#### `ft-call-status-changed`

Emitted when FaceTime call status changes.

```typescript
sdk.on("ft-call-status-changed", ({ callUuid, status }) => {
  console.log(`FaceTime call ${callUuid}: ${status}`);
});
```

### Find My Events

#### `new-findmy-location`

Emitted when a Find My friend's location updates.

```typescript
sdk.on("new-findmy-location", ({ name, friendId, location }) => {
  console.log(`${name} location: ${location.latitude}, ${location.longitude}`);
});
```

### Scheduled Message Events

#### `scheduled-message-sent`

Emitted when a scheduled message is sent.

```typescript
sdk.on("scheduled-message-sent", (data) => {
  console.log("Scheduled message sent:", data);
});
```

#### `scheduled-message-error`

Emitted when a scheduled message fails.

```typescript
sdk.on("scheduled-message-error", (data) => {
  console.error("Scheduled message error:", data);
});
```

#### `scheduled-message-created`

Emitted when a scheduled message is created.

```typescript
sdk.on("scheduled-message-created", (data) => {
  console.log("Scheduled message created:", data);
});
```

#### `scheduled-message-updated`

Emitted when a scheduled message is updated.

```typescript
sdk.on("scheduled-message-updated", (data) => {
  console.log("Scheduled message updated:", data);
});
```

#### `scheduled-message-deleted`

Emitted when a scheduled message is deleted.

```typescript
sdk.on("scheduled-message-deleted", (data) => {
  console.log("Scheduled message deleted:", data);
});
```

### Event Management

```typescript
// Remove event listeners
sdk.off("new-message", messageHandler);

// Remove all listeners for an event
sdk.removeAllListeners("new-message");
```

## Advanced Features

### FaceTime Integration

```typescript
// Create FaceTime link
const link = await sdk.facetime.createFaceTimeLink();
console.log("FaceTime link:", link);

// Listen for FaceTime status changes
sdk.on("ft-call-status-changed", (data) => {
  console.log("FaceTime status:", data.status);
});
```

### iCloud Services

```typescript
// Get Find My Friends
const friends = await sdk.icloud.getFindMyFriends();

// Refresh data
await sdk.icloud.refreshFindMyFriends();
```

### Scheduled Messages

```typescript
// Create scheduled message
const scheduled = await sdk.scheduledMessages.createScheduledMessage({
  chatGuid: "any;-;+1234567890",
  message: "This message was scheduled!",
  scheduledFor: new Date(Date.now() + 60000), // 1 minute from now
  schedule: { type: "once" },
});

// Get all scheduled messages
const allScheduled = await sdk.scheduledMessages.getScheduledMessages();

// Update scheduled message
await sdk.scheduledMessages.updateScheduledMessage("schedule-id", {
  message: "Updated message",
});

// Delete scheduled message
await sdk.scheduledMessages.deleteScheduledMessage("schedule-id");
```

### Server Information

```typescript
// Get server info
const serverInfo = await sdk.server.getServerInfo();

// Get message statistics
const stats = await sdk.server.getMessageStats();

// Get server logs
const logs = await sdk.server.getServerLogs(100);
```

## Error Handling

```typescript
try {
  await sdk.messages.sendMessage({
    chatGuid: "invalid-guid",
    message: "Test",
  });
} catch (error) {
  if (error.response?.status === 404) {
    console.error("Chat not found");
  } else {
    console.error("Send failed:", error.message);
  }
}
```

## Configuration Options

```typescript
interface ClientConfig {
  serverUrl?: string; // Your subdomain: '{your-subdomain}.imsgd.photon.codes'
  apiKey?: string; // Optional API key for authenticated backends
  logLevel?: "debug" | "info" | "warn" | "error"; // Default: 'info'
}
```

## Best Practices

### Resource Management

```typescript
// Always disconnect when done
process.on("SIGINT", async () => {
  await sdk.close();
  process.exit(0);
});
```

### Event Handling

```typescript
// Use specific event handlers
sdk.on("new-message", handleNewMessage);
sdk.on("error", handleError);

// Remove listeners when needed
sdk.off("new-message", handleNewMessage);
```

### Performance Optimization

```typescript
// Use pagination for large queries
const messages = await sdk.messages.getMessages({
  chatGuid: "any;-;+1234567890",
  limit: 100,
  offset: 0,
});

// Clear processed message records (prevents memory leaks)
sdk.clearProcessedMessages(1000);

// Get processed message count
const processedCount = sdk.getProcessedMessageCount();
```

## Examples

The SDK includes comprehensive examples in the `examples/` directory. All examples can be run using Bun:

### Basic Examples

#### `demo-basic.ts` - Listen for Messages

Simple message listener demonstrating event handling.

```bash
bun run examples/demo-basic.ts
```

#### `message-send.ts` - Send a Message

Send a text message to a contact or chat.

```bash
CHAT_GUID="+1234567890" bun run examples/message-send.ts
```

#### `message-attachment.ts` - Send Files

Send images, videos, or other files as attachments.

```bash
CHAT_GUID="+1234567890" bun run examples/message-attachment.ts
```

#### `message-audio.ts` - Send Voice Messages

Send voice messages (audio attachments with special handling).

```bash
CHAT_GUID="+1234567890" AUDIO_FILE_PATH="/path/to/audio.m4a" bun run examples/message-audio.ts
```

### Advanced Examples

#### `message-reaction.ts` - Reactions (Tapbacks)

Add and remove reactions to messages.

```bash
CHAT_GUID="chat-guid" MESSAGE_GUID="message-guid" bun run examples/message-reaction.ts
```

#### `message-edit.ts` - Edit Messages

Edit a sent message. Requires macOS Ventura (13.0) or newer and Private API.

```bash
CHAT_GUID="chat-guid" bun run examples/message-edit.ts
```

#### `message-unsend.ts` - Unsend Messages

Unsend a message within 2 minutes of sending. Requires macOS Ventura (13.0) or newer and Private API.

```bash
CHAT_GUID="chat-guid" bun run examples/message-unsend.ts
```

#### `message-typing.ts` - Typing Indicators

Start and stop typing indicators in a chat. Requires Private API.

```bash
CHAT_GUID="chat-guid" bun run examples/message-typing.ts
```

#### `message-contact-card.ts` - Share Contact Cards

Share contact cards in chats. Requires macOS Big Sur (11.0) or newer and Private API.

```bash
CHAT_GUID="chat-guid" CONTACT_ADDRESS="email-or-phone" bun run examples/message-contact-card.ts
```

#### `message-reply-sticker.ts` - Send Stickers

Send stickers and multipart messages. Requires Private API.

```bash
CHAT_GUID="chat-guid" STICKER_PATH="path/to/image.jpg" bun run examples/message-reply-sticker.ts
```

#### `message-effects.ts` - Message Effects

Send messages with visual effects (confetti, fireworks, balloons, etc.). Requires Private API.

```bash
CHAT_GUID="chat-guid" bun run examples/message-effects.ts
```

#### `message-reply.ts` - Reply to Messages

Reply to a specific message in a chat.

```bash
CHAT_GUID="chat-guid" MESSAGE_GUID="message-guid" bun run examples/message-reply.ts
```

#### `chat-fetch.ts` - Fetch Chats

Retrieve and filter chats from the database.

```bash
bun run examples/chat-fetch.ts
```

#### `chat-group.ts` - Group Chat Management

List and monitor group chats, track membership changes.

```bash
bun run examples/chat-group.ts
```

#### `message-search.ts` - Search Messages

Search through message history with filtering options.

```bash
bun run examples/message-search.ts
```

#### `message-stats.ts` - Message Statistics

View message statistics, chat activity, and analytics.

```bash
bun run examples/message-stats.ts
```

#### `message-scheduled.ts` - Schedule Messages

Schedule one-time and recurring messages.

```bash
CHAT_GUID="+1234567890" bun run examples/message-scheduled.ts
```

#### `facetime-link.ts` - FaceTime Links

Create FaceTime links programmatically. Requires macOS Monterey (12.0) or newer and Private API.

```bash
bun run examples/facetime-link.ts
```

#### `findmy-friends.ts` - Find My Integration

Track friends via Find My network.

```bash
bun run examples/findmy-friends.ts
```

#### `contact-list.ts` - Contact Access

Access and search macOS Contacts database.

```bash
bun run examples/contact-list.ts
```

#### `demo-advanced.ts` - Advanced Features

Demonstrates permissions checking, chat retrieval, and event monitoring.

```bash
bun run examples/demo-advanced.ts
```

#### `auto-reply-hey.ts` - Auto-Reply Example

Automatic reply example that responds to incoming messages.

```bash
bun run examples/auto-reply-hey.ts
```

## LLMs

You can download the `llms.txt` helper file for language models here:

- [Download llms.txt](./llms.txt)

## License

MIT License

## Author

[@Artist-MOBAI](https://github.com/Artist-MOBAI)
