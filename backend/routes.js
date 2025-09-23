// routes.js
const express = require('express');
const router = express.Router();
const { signup, login, refreshToken, getGraph, getNoteById, createNote, updateNote, deleteNote } = require('./controller');
const authenticateToken = require('./middleware/auth');  // ✅ Import middleware

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refreshToken);

// --- Notes / Graph (Protected) ---
router.get('/graph', authenticateToken, getGraph);
router.get('/notes/:id', authenticateToken, getNoteById);
router.post('/notes', authenticateToken, createNote);
router.put('/notes/:id', authenticateToken, updateNote);
router.delete('/notes/:id', authenticateToken, deleteNote);

module.exports = router;
