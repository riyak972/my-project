const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Messages array - will reset when server restarts
let messages = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Send existing messages to new user
  socket.emit('messages', messages);
  
  socket.on('sendMessage', (data) => {
    const message = {
      username: data.username,
      text: data.text,
      time: new Date().toLocaleTimeString()
    };
    
    messages.push(message);
    io.emit('newMessage', message);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Chat history will reset when server restarts');
});