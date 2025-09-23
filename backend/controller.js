const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helpers
const createTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
  return { accessToken, refreshToken };
};

// ---------------- AUTH CONTROLLERS ----------------
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email & password required' });

    const hashed = await bcrypt.hash(password, 10);
    const conn = await pool.getConnection();

    try {
      await conn.query('INSERT INTO users (email, password) VALUES (?, ?)', [
        email,
        hashed,
      ]);
      res.status(201).json({ message: 'Signup successful' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY')
        return res.status(409).json({ message: 'Email already exists', error: err.message });
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email & password required' });

    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    conn.release();

    if (!rows.length)
      return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials' });

    const tokens = createTokens(user.id);

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: rememberMe ? tokens.refreshToken : null,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

exports.refreshToken = (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(401).json({ message: 'Refresh token required' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err)
        return res.status(403).json({ message: 'Invalid refresh token', error: err.message });

      const { accessToken, refreshToken } = createTokens(decoded.id);
      res.json({ accessToken, refreshToken });
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// ---------------- NOTE CONTROLLERS ----------------
exports.getGraph = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const userId = req.user.id;

    const [nodes] = await conn.query(
      'SELECT id, title FROM notes WHERE user_id = ?',
      [userId]
    );
    const [links] = await conn.query(
      'SELECT source_note_id AS source, target_note_id AS target FROM note_links WHERE user_id = ?',
      [userId]
    );

    res.json({ nodes, links });
  } catch (err) {
    console.error('Get graph error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  } finally {
    if (conn) conn.release();
  }
};

exports.createNote = async (req, res) => {
  let conn;
  try {
    const { title, parentId } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const userId = req.user.id;
    conn = await pool.getConnection();

    // 1️⃣ Insert the new note
    const [noteResult] = await conn.query(
      "INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)",
      [userId, title, ""]
    );
    const newNoteId = noteResult.insertId;

    // 2️⃣ If parentId exists, create link in note_links
    if (parentId) {
      await conn.query(
        `INSERT INTO note_links (user_id, source_note_id, target_note_id)
         VALUES (?, ?, ?)`,
        [userId, parentId, newNoteId]
      );
    }

    // 3️⃣ Respond with new note info
    res.status(201).json({
      id: newNoteId,
      title,
      parentId: parentId || null,
    });
  } catch (err) {
    console.error("Create note error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  } finally {
    if (conn) conn.release();
  }
};

exports.updateNote = async (req, res) => {
  let conn;
  try {
    const noteId = req.params.id;
    const { title, content, parentId } = req.body; // parentId can be null
    const userId = req.user.id;

    // Prevent self-linking
    if (parentId === noteId) {
      return res.status(400).json({ message: "Note cannot be its own parent" });
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1️⃣ Update note content
    const [result] = await conn.query(
      "UPDATE notes SET title=?, content=? WHERE id=? AND user_id=?",
      [title, content, noteId, userId]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Note not found" });
    }

    // 2️⃣ Handle parent link
    const [existingLinks] = await conn.query(
      "SELECT id, source_note_id FROM note_links WHERE target_note_id=? AND user_id=?",
      [noteId, userId]
    );

    if (parentId) {
      if (existingLinks.length > 0) {
        // Update existing link
        await conn.query(
          "UPDATE note_links SET source_note_id=? WHERE id=?",
          [parentId, existingLinks[0].id]
        );
      } else {
        // Insert new link
        await conn.query(
          "INSERT INTO note_links (user_id, source_note_id, target_note_id) VALUES (?, ?, ?)",
          [userId, parentId, noteId]
        );
      }
    } else if (existingLinks.length > 0) {
      // Remove link if parentId is null
      await conn.query(
        "DELETE FROM note_links WHERE id=?",
        [existingLinks[0].id]
      );
    }

    await conn.commit();

    // 3️⃣ Return updated note info including parent
    const [updatedRows] = await conn.query(
      `
      SELECT n.id, n.title, n.content, nl.source_note_id AS parentId
      FROM notes n
      LEFT JOIN note_links nl
        ON nl.target_note_id = n.id AND nl.user_id = ?
      WHERE n.id = ? AND n.user_id = ?
      LIMIT 1
      `,
      [userId, noteId, userId]
    );

    res.json({ message: "Note updated", note: updatedRows[0] });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Update note error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  } finally {
    if (conn) conn.release();
  }
};

exports.deleteNote = async (req, res) => {
  let conn;
  try {
    const noteId = req.params.id;
    conn = await pool.getConnection();

    const [result] = await conn.query(
      'DELETE FROM notes WHERE id=? AND user_id=?',
      [noteId, req.user.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Note not found' });

    res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  } finally {
    if (conn) conn.release();
  }
};

exports.getNoteById = async (req, res) => {
  let conn;
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    conn = await pool.getConnection();

    const [rows] = await conn.query(
      `
      SELECT 
        n.id, n.title, n.content,
        nl.source_note_id AS parentId
      FROM notes n
      LEFT JOIN note_links nl
        ON nl.target_note_id = n.id AND nl.user_id = ?
      WHERE n.id = ? AND n.user_id = ?
      LIMIT 1
      `,
      [userId, noteId, userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Get note by ID error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  } finally {
    if (conn) conn.release();
  }
};