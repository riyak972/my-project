import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isJoined, setIsJoined] = useState(false); // New state to track if user has joined
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('messages', (msgs) => setMessages(msgs));
    socket.on('newMessage', (msg) => setMessages(prev => [...prev, msg]));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const joinChat = () => {
    if (username.trim()) {
      setIsJoined(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      joinChat();
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && username) {
      socket.emit('sendMessage', { username, text: message });
      setMessage('');
    }
  };

  if (!isJoined) {
    return (
      <div className="auth">
        <h2>Enter Your Name</h2>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your name"
          onKeyPress={handleKeyPress}
        />
        <button onClick={joinChat} disabled={!username.trim()}>
          Join Chat
        </button>
      </div>
    );
  }

  return (
    <div className="chat">
      <header>
        <h2>Real-Time Chat</h2>
        <p>Welcome, {username}!</p>
      </header>

      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.username === username ? 'own' : ''}`}>
            <strong>{msg.username}</strong> 
            <span className="time">[{msg.time}]:</span> 
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="input-form">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;