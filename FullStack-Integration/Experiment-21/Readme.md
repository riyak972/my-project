# Real-Time Chat Application

A full-stack real-time chat application built with **React**, **Vite**, **Node.js**, **Express**, and **Socket.io**.


## Features
- Real-time messaging with WebSocket (Socket.io)
- Multi-user chat with username identification
- Message history during server session
- Responsive UI for all devices
- Auto-scroll and timestamp display


## Architecture

| Layer               | Technology          | Responsibility                 |
|--------------------|------------------|-------------------------------|
| Presentation       | React + Vite      | UI rendering                   |
| Communication      | Socket.io Client  | Real-time data exchange         |
| Business Logic     | Node.js + Express | Request handling               |
| Real-time Layer    | Socket.io Server  | WebSocket management           |
| Transport          | HTTP/WebSocket    | Data transmission              |

**Data Flow:**
- User joins → React state updates → Socket connects → Message history loads
- Sending message → `sendMessage` → Server validates → `newMessage` broadcast → UI updates


##  Real-Time Events

**Client → Server:**  
- `sendMessage` – Send chat messages  

**Server → Client:**  
- `messages` – Load initial messages  
- `newMessage` – Broadcast new messages  

**Message Structure:**
```ts
interface ChatMessage {
  username: string;
  text: string;
  time: string; // HH:MM:SS
}
``` 

## UI Components 

### Authentication Screen
- **Username Input**: Enter display name
- **Validation**: Ensures non-empty input
- **Join Button**: Enter chat room

### Chat Interface
- **Header**: Shows app title & welcome message
- **Messages Container**:
  - Scrollable chat history
  - Own messages highlighted differently
  - Timestamps for each message
  - Auto-scroll to latest messages
- **Input Area**:
  - Message text input
  - Send button
  - Real-time typing feedback

## Setup

### Backend
```bash
cd backend
npm install
npm run dev  # Port: 5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Vite server, Port: 5173
```
Access: Open http://localhost:5173 in browser. Multiple tabs for testing real-time messaging.


## Production Considerations
- Configure environment variables & CORS policies
- Use a database for persistent message storage
- Implement SSL for secure connections
- Set up load balancing for multiple server instances


## Testing
- Single & multi-user messaging 
- Real-time message updates 
- Responsive design across devices 
- Cross-browser compatibility 
- Error handling & reconnection testing 


## Requirements
**Backend:** Node.js, Express, Socket.io, CORS  
**Frontend:** React, Socket.io-client, modern web browser, CSS3  
**Network:** WebSocket & HTTP/HTTPS support


## Learning Outcomes
- Understand full-stack architecture of real-time applications
- Implement WebSocket communication using Socket.io
- Manage React state for dynamic UI updates
- Handle multi-user real-time interactions
- Configure backend for development and production
- Apply responsive design and cross-browser compatibility techniques
