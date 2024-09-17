const express = require('express');
const { login, signupUser, getUserById, getAllUsers } = require('../controllers/authController');

const router = express.Router();

// Register route
router.post('/signup', signupUser);

// Login route
router.post('/login', login);

module.exports = router;
