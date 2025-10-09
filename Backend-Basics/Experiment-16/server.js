const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

app.use(function (req, res, next) {
  var timestamp = new Date().toISOString();
  console.log('[' + timestamp + '] ' + req.method + ' ' + req.url);
  next();
});

function bearerAuth(req, res, next) {
  var header = req.headers['authorization'];
  if (!header || typeof header !== 'string') {
    return res.status(401).json({ message: 'Authorization header missing or incorrect' });
  }
  var parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || parts[1] !== 'mysecrettoken') {
    return res.status(401).json({ message: 'Authorization header missing or incorrect' });
  }
  next();
}

const router = express.Router();

router.use(function (req, res, next) {
  console.log('Admin router middleware executed');
  next();
});

router.get('/dashboard', function (req, res) {
  res.send('Admin dashboard');
});

app.use('/admin', bearerAuth, router);

let users = [];

// Create a user (POST /users)
app.post('/users', (req, res) => {
  const user = req.body;
  users.push(user);
  res.status(201).json({ message: 'User added', user });
});

// Get all users (GET /users)
app.get('/users', (req, res) => {
  res.status(200).json(users);
});

// Update a user (PUT /users/:id)
app.put('/users/:id', (req, res) => {
  const id = req.params.id;
  const updatedUser = req.body;
  users = users.map(user => (user.id === id ? updatedUser : user));
  res.status(200).json({ message: 'User updated', updatedUser });
});

// Delete a user (DELETE /users/:id)
app.delete('/users/:id', (req, res) => {
  const id = req.params.id;
  users = users.filter(user => user.id !== id);
  res.status(200).json({ message: 'User deleted' });
});

app.get('/public', function (req, res) {
	res.send('This is a public route. No authentication required.');
});

app.get('/protected', bearerAuth, function (req, res) {
	res.send('You have accessed a protected route with a valid Bearer token!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});