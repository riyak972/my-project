const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = 'supersecretkey';
const TOKEN_HEADER = 'authorization';

// ✅ Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Simple request logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// 🔒 In-memory user accounts
const accounts = {
  user1: {
    username: 'user1',
    password: 'password123',
    balance: 1000
  }
};

// 🔑 Generate JWT token
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h',
    algorithm: 'HS256'
  });
}

// 🔐 JWT authentication middleware
function authenticateToken(req, res, next) {
  const header = req.headers[TOKEN_HEADER];
  if (!header || typeof header !== 'string') {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid authorization format' });
  }

  jwt.verify(parts[1], JWT_SECRET, { algorithms: ['HS256'] }, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
}

// ✅ Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const account = accounts[username];
  if (!account || account.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken({ username: account.username });
  res.status(200).json({ token });
});

// ✅ Get balance (protected)
app.get('/balance', authenticateToken, (req, res) => {
  const account = accounts[req.user.username];
  if (!account) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json({ balance: account.balance });
});

// ✅ Deposit money (protected)
app.post('/deposit', authenticateToken, (req, res) => {
  const amount = Number(req.body.amount);

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Deposit amount must be a positive number' });
  }

  const account = accounts[req.user.username];
  if (!account) {
    return res.status(404).json({ message: 'User not found' });
  }

  account.balance += amount;

  res.status(200).json({
    message: `Deposited $${amount}`,
    newBalance: account.balance
  });
});

// ✅ Withdraw money (protected)
app.post('/withdraw', authenticateToken, (req, res) => {
  const amount = Number(req.body.amount);

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Withdrawal amount must be a positive number' });
  }

  const account = accounts[req.user.username];
  if (!account) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (amount > account.balance) {
    return res.status(400).json({ message: 'Insufficient balance' });
  }

  account.balance -= amount;

  res.status(200).json({
    message: `Withdrew $${amount}`,
    newBalance: account.balance
  });
});

// ✅ Generic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: 'Something went wrong' });
});

// 🚀 Start server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
