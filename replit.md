# Fun Friday Group - Anonymous Chat

## Overview

This is a real-time anonymous chat application that allows multiple users to communicate in a group setting while maintaining anonymity. Built with Node.js, Express, Socket.IO, and PostgreSQL, the application provides instant messaging capabilities with live user count tracking and persistent message storage. Users must enter their name on startup and can toggle between showing their real name or appearing as "Anonymous" using the header button.

## Recent Changes (September 30, 2025)

- **PostgreSQL Integration:** All messages are now stored in a PostgreSQL database with proper schema (username, message, is_anonymous, timestamp)
- **Username Entry Modal:** Users must enter their name before accessing the chat interface
- **Anonymous Toggle Button:** Added button in the header to switch between displaying real name and "Anonymous"
- **Message History:** When users connect, they receive the last 100 messages from the database
- **Database Persistence:** All chat messages are automatically saved to PostgreSQL for permanent storage

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js
- **Web Framework:** Express 5.1.0
- **Real-time Communication:** Socket.IO 4.8.1
- **Database:** PostgreSQL (via pg client library)
- **Message Persistence:** All messages stored in PostgreSQL database

**Server Design:**
The application uses a single-server architecture with WebSocket support for bidirectional real-time communication. The server handles:

1. **Static File Serving:** Express serves the frontend files from the `public` directory
2. **WebSocket Connections:** Socket.IO manages real-time connections on top of HTTP
3. **Event-Driven Architecture:** All chat interactions use event emitters/listeners pattern

**Key Architectural Decisions:**

*Active User Tracking:*
- **Problem:** Need to show accurate online user count
- **Solution:** Server-side counter incremented on connection, decremented on disconnect
- **Rationale:** Simple in-memory counter is sufficient for single-server deployments; broadcasts count to all clients on change

*Message Broadcasting:*
- **Problem:** All users need to see messages instantly
- **Solution:** `io.emit()` broadcasts to all connected clients and saves to PostgreSQL database
- **Rationale:** Broadcast pattern ensures real-time delivery while database persistence maintains message history

*Session Management:*
- **Problem:** Identify message senders without requiring authentication
- **Solution:** Socket.IO automatically assigns unique socket IDs per connection
- **Rationale:** Ephemeral identifiers enable client-side message ownership detection without user accounts

### Frontend Architecture

**Technology Stack:**
- Pure JavaScript (no frameworks)
- Native DOM manipulation
- Socket.IO client library

**Client Design:**
Single-page application with real-time UI updates driven by WebSocket events.

**Key Components:**

1. **Connection Management:** Establishes WebSocket connection on page load and tracks own socket ID
2. **Message Display:** Dynamically creates message elements with different styling for own vs. other messages
3. **User Count Display:** Real-time updates showing active participants
4. **Anonymous UX:** Visual indicators (notices, avatars) reinforce anonymous nature

**Layout Structure:**
- Fixed header with group info and user count
- Scrollable message area
- Fixed bottom input area

### Data Flow

**Message Flow:**
1. User types message and clicks send
2. Client emits `chat_message` event with message data
3. Server receives event and broadcasts to all clients with timestamp and metadata
4. All clients receive `chat_message` event and render message
5. Clients distinguish own messages using socket ID comparison

**User Connection Flow:**
1. Client connects and receives socket ID
2. Client emits `user_joined` event
3. Server increments counter and broadcasts `user_count` to all clients
4. Server broadcasts `user_joined` notification to all clients except sender
5. On disconnect, server decrements counter and broadcasts updated count

### Design Patterns

- **Event-Driven Architecture:** All interactions use publish-subscribe pattern via Socket.IO
- **Broadcast Communication:** Server broadcasts state changes to all connected clients
- **Client-Side Rendering:** All UI updates handled in browser via DOM manipulation

## External Dependencies

### Third-Party Libraries

**Socket.IO (v4.8.1):**
- **Purpose:** Real-time bidirectional event-based communication
- **Usage:** WebSocket connections with fallback to HTTP long-polling
- **Why Chosen:** Industry-standard library for real-time web applications; handles connection management, reconnection, and cross-browser compatibility automatically

**Express (v5.1.0):**
- **Purpose:** Web application framework for Node.js
- **Usage:** Static file serving and HTTP server foundation for Socket.IO
- **Why Chosen:** Minimal, unopinionated framework perfect for simple server setup; provides routing and middleware capabilities if expansion is needed

### Runtime Dependencies

**Node.js Built-ins:**
- `http` module: Creates HTTP server instance that Socket.IO wraps

**PostgreSQL Database:**
- `pg` module: PostgreSQL client for Node.js
- Database URL configured via environment variables
- Message table schema: id, username, message, is_anonymous, timestamp, created_at

### Development Considerations

**Scalability Limitations:**
- In-memory user count won't sync across multiple server instances
- No load balancer or sticky session support configured

**Potential Enhancements Would Require:**
- Redis adapter for Socket.IO to enable multi-server deployments
- User authentication service for optional user accounts
- Rate limiting middleware to prevent spam
- Message pagination for better performance with large message history