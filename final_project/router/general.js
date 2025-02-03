const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();
const bodyParser = require('body-parser');
const app = express();

// Middlewares essenciais
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const normalizeString = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  };

// Task 6: Register
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({message: "Username/password required"});
  }
  
  if (!isValid(username)) {
    return res.status(400).json({message: "Invalid username format"});
  }
  
  if (users.some(user => user.username === username)) {
    return res.status(409).json({message: "Username exists"});
  }
  
  users.push({username, password});
  return res.status(201).json({message: "User registered"});
});

// Task 1: Get All Books
public_users.get('/', function(req, res) {
  return res.status(200).json(books);
});

// Task 2: Get by ISBN (já implementado)
public_users.get('/isbn/:isbn', function(req, res) {
  const isbn = req.params.isbn;
  return res.status(200).json(books[isbn] || {message: "Book not found"});
});

// Task 3: Get by Author (Versão Corrigida)
public_users.get('/author/:author', function(req, res) {
    const searchAuthor = normalizeString(req.params.author);
    const results = Object.values(books).filter(book => 
      normalizeString(book.author).includes(searchAuthor)
    );
    
    return results.length > 0 
      ? res.status(200).json(results) 
      : res.status(404).json({message: "Author not found"});
  });

// Task 4: Get by Title (Versão Corrigida)
public_users.get('/title/:title', function(req, res) {
    const searchTitle = normalizeString(req.params.title);
    const results = Object.values(books).filter(book => 
      normalizeString(book.title).includes(searchTitle)
    );
    
    return results.length > 0 
      ? res.status(200).json(results) 
      : res.status(404).json({message: "Title not found"});
  });

// Task 5: Get Reviews
public_users.get('/review/:isbn', function(req, res) {
  const isbn = req.params.isbn;
  return books[isbn]?.reviews 
    ? res.status(200).json(books[isbn].reviews)
    : res.status(404).json({message: "No reviews found"});
});

// Tasks 10-13: Async Implementations
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({message: "Error fetching books"});
  }
});

public_users.get('/async/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${req.params.isbn}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({message: "Book not found"});
  }
});

public_users.get('/async/author/:author', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5000/author/${req.params.author}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({message: "Author not found"});
  }
});

public_users.get('/async/title/:title', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5000/title/${req.params.title}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({message: "Title not found"});
  }
});

module.exports.general = public_users;