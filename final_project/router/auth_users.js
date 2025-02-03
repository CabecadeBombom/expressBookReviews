const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Task 6 Helper
const isValid = (username) => {
  return /^[a-zA-Z0-9_]{4,}$/.test(username); // Valida formato do username
};

// Task 7 Helper
const authenticatedUser = (username, password) => {
  return users.some(user => 
    user.username === username && 
    user.password === password
  );
};

// Task 7: Login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({message: "Username/password required"});
  }
  
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({message: "Invalid credentials"});
  }
  
  const token = jwt.sign({username}, 'secret_key', {expiresIn: '1h'});
  return res.status(200).json({
    message: "Login successful",
    token: token
  });
});

// Middleware para Task 8-9
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(403).json({message: "No token provided"});
  
  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) return res.status(401).json({message: "Invalid/expired token"});
    req.user = decoded;
    next();
  });
};

// Task 8: Add/Modify Review
regd_users.put("/auth/review/:isbn", verifyToken, (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.user.username;

  if (!books[isbn]) return res.status(404).json({message: "Book not found"});
  
  books[isbn].reviews = books[isbn].reviews || {};
  books[isbn].reviews[username] = review;
  
  return res.status(200).json({
    message: "Review updated",
    reviews: books[isbn].reviews
  });
});

// Task 9: Delete Review
regd_users.delete("/auth/review/:isbn", verifyToken, (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  if (!books[isbn]?.reviews?.[username]) {
    return res.status(404).json({message: "Review not found"});
  }
  
  delete books[isbn].reviews[username];
  return res.status(200).json({
    message: "Review deleted",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;