<div align="center">

![Banner](./.github/assets/banner.png)

# Advanced iMessage Kit

> Powerful TypeScript iMessage SDK with real-time message processing

</div>

[![TypeScript](https://img.shields.io/badge/TypeScript-^5-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Advanced iMessage Kit is a comprehensive iMessage SDK for **reading**, **sending**, and **automating** iMessage conversations on macOS. Designed for building **AI agents**, **automation tools**, and **chat applications**.

## Features

- **🔒 Type Safe** - Complete TypeScript support with full type definitions
- **⚡ Real-time Communication** - WebSocket-based event system for instant message updates
- **📱 Complete API** - Send text, attachments, reactions, edit messages, and more
- **👥 Group Management** - Create groups, manage members, set group icons
- **📎 Rich Attachments** - Send images, files, stickers, and contact cards
- **🔍 Advanced Querying** - Powerful message filtering and search capabilities
- **📊 Analytics** - Message counts, delivery status, and chat statistics
- **🎯 Event-driven** - Listen for new messages, typing indicators, and status changes

## Quick Start

### Installation

```bash
npm install @photon-ai/advanced-imessage-kit
# or
bun add @photon-ai/advanced-imessage-kit
```

### Basic Usage

```typescript
import { AdvancedIMessageKit } from '@photon-ai/advanced-imessage-kit'

const sdk = new AdvancedIMessageKit({
    serverUrl: '{your-subdomain}.imsgd.photon.codes' // Your subdomain is the unique link address assigned to you
})

// Connect to the server
await sdk.connect()

// Listen for new messages
sdk.on('new-message', (message) => {
    console.log('New message:', message.text)
})

// Send a message
await sdk.messages.sendMessage({
    chatGuid: 'any;-;+1234567890',
    message: 'Hello World!'
})

// Disconnect when done
await sdk.disconnect()
```

## Core API

### Initialization & Connection

```typescript
import { AdvancedIMessageKit } from '@photon-ai/advanced-imessage-kit'

const sdk = new AdvancedIMessageKit({
    serverUrl: '{your-subdomain}.imsgd.photon.codes',  // Your subdomain is the unique link address assigned to you
    logLevel: 'info'                                   // Log level: 'debug' | 'info' | 'warn' | 'error'
})

// Connect to server
await sdk.connect()

// Check connection status
sdk.on('ready', () => {
    console.log('SDK is ready!')
})

// Graceful disconnect
await sdk.disconnect()
```

### Connection Management

```typescript
// Message deduplication (prevents duplicate processing)
sdk.clearProcessedMessages(1000)  // Clear old processed message records
const count = sdk.getProcessedMessageCount()  // Get processed message count
```

## Message Operations

### Sending Messages

```typescript
// Send text message
const message = await sdk.messages.sendMessage({
    chatGuid: 'any;-;+1234567890',
    message: 'Hello World!'
})

// Send message with options
await sdk.messages.sendMessage({
    chatGuid: 'any;-;+1234567890',
    message: 'Important message',
    subject: 'Subject line',
    effectId: 'com.apple.messages.effect.CKConfettiEffect'
})

// Reply to message
await sdk.messages.sendMessage({
    chatGuid: 'any;-;+1234567890',
    message: 'This is a reply',
    selectedMessageGuid: 'original-message-guid'
})
```

### Message Querying

```typescript
// Get messages with filters
const messages = await sdk.messages.getMessages({
    chatGuid: 'any;-;+1234567890',
    limit: 50,
    offset: 0
})

// Get message counts
const totalCount = await sdk.messages.getMessageCount({
    chatGuid: 'any;-;+1234567890',
    after: 1640995200000, // Timestamp
    before: 1641081600000 // Timestamp
})

const sentCount = await sdk.messages.getSentMessageCount()
```

### Message Actions

```typescript
// Edit message
await sdk.messages.editMessage({
    messageGuid: 'message-guid',
    editedMessage: 'Updated text',
    backwardsCompatibilityMessage: 'Updated text'
})

// Add reaction
await sdk.messages.sendReaction({
    chatGuid: 'any;-;+1234567890',
    messageGuid: 'message-guid',
    reaction: 'love', // Options: love, like, dislike, laugh, emphasize, question, -love, -like, etc.
    partIndex: 0 // Optional: defaults to 0
})

// Unsend message
await sdk.messages.unsendMessage({
    messageGuid: 'message-guid'
})
```

## Chat Management

### Chat Operations

```typescript
// Get all chats
const chats = await sdk.chats.getChats()

// Get specific chat
const chat = await sdk.chats.getChat('chat-guid', {
    with: ['participants', 'lastMessage']
})

// Create new chat
const newChat = await sdk.chats.createChat({
    addresses: ['+1234567890', '+0987654321'],
    message: 'Hello everyone!',
    service: 'iMessage', // 'iMessage' or 'SMS'
    method: 'private-api' // 'apple-script' or 'private-api'
})
```

### Group Management

```typescript
// Update group name
await sdk.chats.updateChat('chat-guid', {
    displayName: 'My Group Chat'
})

// Add participant
await sdk.chats.addParticipant('chat-guid', '+1234567890')

// Remove participant
await sdk.chats.removeParticipant('chat-guid', '+1234567890')

// Leave group
await sdk.chats.leaveChat('chat-guid')
```

### Group Icons

```typescript
// Set group icon
await sdk.chats.setGroupIcon('chat-guid', '/path/to/image.jpg')

// Get group icon
const iconBuffer = await sdk.chats.getGroupIcon('chat-guid')

// Remove group icon
await sdk.chats.removeGroupIcon('chat-guid')
```

### Chat Status

```typescript
// Mark as read/unread
await sdk.chats.markChatRead('chat-guid')
await sdk.chats.markChatUnread('chat-guid')

// Typing indicators
await sdk.chats.startTyping('chat-guid')
await sdk.chats.stopTyping('chat-guid')

// Get chat messages
const messages = await sdk.chats.getChatMessages('chat-guid', {
    limit: 100,
    offset: 0,
    sort: 'DESC'
})
```

## Attachments & Media

### Sending Attachments

```typescript
// Send file attachment
const message = await sdk.attachments.sendAttachment({
    chatGuid: 'any;-;+1234567890',
    filePath: '/path/to/file.jpg',
    fileName: 'custom-name.jpg' // Optional
})

// Send sticker
await sdk.attachments.sendSticker({
    chatGuid: 'any;-;+1234567890',
    filePath: '/path/to/sticker.png',
    selectedMessageGuid: 'message-to-reply-to' // Optional
})
```

### Attachment Info

```typescript
// Get attachment details
const attachment = await sdk.attachments.getAttachment('attachment-guid')

// Get attachment count
const count = await sdk.attachments.getAttachmentCount()
```

## Contacts & Handles

### Contact Management

```typescript
// Get all contacts
const contacts = await sdk.contacts.getContacts()

// Get contact card
const contactCard = await sdk.contacts.getContactCard('+1234567890')

// Share contact card
await sdk.contacts.shareContactCard('chat-guid')

// Check if should share contact
const shouldShare = await sdk.contacts.shouldShareContact('chat-guid')
```

### Handle Operations

```typescript
// Query handles
const result = await sdk.handles.queryHandles({
    address: '+1234567890',
    with: ['chats'],
    limit: 50
})

// Get handle availability
const isAvailable = await sdk.handles.getHandleAvailability('handle-guid', 'imessage')

// Get focus status
const focusStatus = await sdk.handles.getHandleFocusStatus('handle-guid')
```

## Real-time Events

```typescript
// Message events
sdk.on('new-message', (message) => {
    console.log('New message received:', message.text)
})

sdk.on('updated-message', (message) => {
    console.log('Message updated:', message.guid)
})

// Typing indicators
sdk.on('typing-indicator', (data) => {
    console.log('Typing status changed:', data)
})

// Connection events
sdk.on('ready', () => {
    console.log('SDK connected and ready')
})

sdk.on('error', (error) => {
    console.error('SDK error:', error)
})

// Remove event listeners
sdk.off('new-message', messageHandler)
```

## Advanced Features

### FaceTime Integration

```typescript
// Create FaceTime link
const link = await sdk.facetime.createFaceTimeLink()
console.log('FaceTime link:', link)

// Listen for FaceTime status changes
sdk.on('facetime-status-change', (data) => {
    console.log('FaceTime status:', data.status)
})
```

### iCloud Services

```typescript
// Get Find My Friends
const friends = await sdk.icloud.getFindMyFriends()

// Get Find My Devices
const devices = await sdk.icloud.getFindMyDevices()

// Refresh data
await sdk.icloud.refreshFindMyFriends()
await sdk.icloud.refreshFindMyDevices()
```

### Scheduled Messages

```typescript
// Create scheduled message
const scheduled = await sdk.scheduledMessages.createScheduledMessage({
    chatGuid: 'any;-;+1234567890',
    message: 'This message was scheduled!',
    scheduledFor: new Date(Date.now() + 60000), // 1 minute from now
    schedule: { type: 'once' }
})

// Get all scheduled messages
const allScheduled = await sdk.scheduledMessages.getScheduledMessages()

// Update scheduled message
await sdk.scheduledMessages.updateScheduledMessage('schedule-id', {
    message: 'Updated message'
})

// Delete scheduled message
await sdk.scheduledMessages.deleteScheduledMessage('schedule-id')
```

### Server Information

```typescript
// Get server info
const serverInfo = await sdk.server.getServerInfo()

// Get message statistics
const stats = await sdk.server.getMessageStats()

// Get server logs
const logs = await sdk.server.getServerLogs(100)

// Get alerts
const alerts = await sdk.server.getAlerts()

// Mark alerts as read
await sdk.server.markAlertAsRead(['alert-id-1', 'alert-id-2'])
```

## Error Handling

```typescript
try {
    await sdk.messages.sendMessage({
        chatGuid: 'invalid-guid',
        message: 'Test'
    })
} catch (error) {
    if (error.response?.status === 404) {
        console.error('Chat not found')
    } else {
        console.error('Send failed:', error.message)
    }
}
```

## Configuration Options

```typescript
interface ClientConfig {
    serverUrl?: string      // Your subdomain: '{your-subdomain}.imsgd.photon.codes'
    logLevel?: 'debug' | 'info' | 'warn' | 'error'  // Default: 'info'
}
```

## Best Practices

### Resource Management

```typescript
// Always disconnect when done
process.on('SIGINT', async () => {
    await sdk.disconnect()
    process.exit(0)
})
```

### Event Handling

```typescript
// Use specific event handlers
sdk.on('new-message', handleNewMessage)
sdk.on('error', handleError)

// Remove listeners when needed
sdk.off('new-message', handleNewMessage)
```

### Performance Optimization

```typescript
// Use pagination for large queries
const messages = await sdk.messages.getMessages({
    chatGuid: 'any;-;+1234567890',
    limit: 100,
    offset: 0
})

// Clear processed message records (prevents memory leaks)
sdk.clearProcessedMessages(1000)

// Get processed message count
const processedCount = sdk.getProcessedMessageCount()
```

## Examples

Check the `/examples` directory for complete working examples:

- `demo-basic.ts` - Basic SDK usage and event listening
- `demo-advanced.ts` - Advanced SDK features
- `message-send.ts` - Send messages
- `message-attachment.ts` - Send files and images
- `message-contact-card.ts` - Send contact cards
- `message-edit.ts` - Edit messages
- `message-unsend.ts` - Unsend messages
- `message-reaction.ts` - Add reactions
- `message-reply.ts` - Reply to messages
- `message-typing.ts` - Typing indicators
- `message-scheduled.ts` - Scheduled messages
- `message-search.ts` - Search messages
- `message-stats.ts` - Message statistics
- `chat-group.ts` - Group chat management
- `chat-fetch.ts` - Fetch chat data
- `contact-list.ts` - Contact management
- `facetime-link.ts` - FaceTime integration
- `findmy-friends.ts` - Find My integration
- `auto-reply-hey.ts` - Auto-reply example

## License

MIT License