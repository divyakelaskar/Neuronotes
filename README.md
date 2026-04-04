# Neuronotes

A full-stack, graph-based note-taking application that models knowledge as a connected network of nodes and relationships. Built with a focus on relational data modeling, API design, and real-time graph visualization.

[![Demo](http://img.youtube.com/vi/pI4hRxJRlJE/maxresdefault.jpg)](https://www.youtube.com/watch?v=pI4hRxJRlJE)

---

## 🚀 Key Features

* Graph-based note system with dynamic node-link relationships
* Markdown editor with live preview and syntax highlighting
* Real-time graph updates on create/edit/delete operations
* JWT-based authentication with protected routes
* Hierarchical and relational note organization
* Interactive force-directed graph visualization

---

## 🧱 Tech Stack

**Frontend**

* React 18, React Router
* Tailwind CSS
* react-force-graph-2d

**Backend**

* Node.js, Express
* JWT Authentication

**Database**

* MySQL (relational schema with graph modeling)

---

## 🗄️ Data Architecture

The application models a **knowledge graph using a relational database**.

### Core Tables

* `users` → application users
* `notes` → individual note entities
* `note_links` → directed relationships between notes (graph edges)

### Graph Modeling Strategy

* Each note represents a node
* Relationships stored as directed edges:
  `source_note_id → target_note_id`
* Enables efficient traversal and dynamic visualization

### Design Decisions

* Relational DB used for strong consistency and referential integrity
* Foreign keys with `ON DELETE CASCADE` ensure graph consistency
* `user_id` enforced across tables for data isolation
* Indexed relationship queries for performance

---

## ⚡ Query Patterns

### Fetch full graph

```sql
SELECT source_note_id, target_note_id
FROM note_links
WHERE user_id = ?;
```

### Fetch notes with connections

```sql
SELECT n.*, nl.target_note_id
FROM notes n
LEFT JOIN note_links nl ON n.id = nl.source_note_id
WHERE n.user_id = ?;
```

---

## 🔐 Authentication

* JWT-based authentication (access + refresh tokens)
* Protected routes with middleware validation
* Token refresh mechanism
* User-scoped queries to prevent unauthorized access

---

## 📡 API Design

```http
GET    /graph           - Fetch full graph (nodes + edges)
GET    /notes/:id       - Fetch single note
POST   /notes           - Create note
PUT    /notes/:id       - Update note
DELETE /notes/:id       - Delete note
POST   /auth/login      - Login
POST   /auth/register   - Register
POST   /auth/refresh    - Refresh token
```

---

## 🎯 Core Functionality

### Graph Engine

* Force-directed graph visualization
* Dynamic node sizing (root vs connected nodes)
* Real-time updates on structural changes

### Note System

* Create, edit, delete notes
* Define parent-child relationships
* Dynamically reorganize graph structure

### Markdown Engine

* GitHub Flavored Markdown
* Syntax highlighting
* Live preview with scroll sync

---

## 🚀 Performance Considerations

* Indexed `(user_id, source_note_id, target_note_id)` for fast queries
* Optimized joins for graph traversal
* Reduced payload size in API responses
* Controlled re-renders in graph updates

---

## 🏗️ Project Structure

```
src/
├── pages/
├── components/
├── utils/
├── services/
├── middleware/
└── App.jsx
```

---

## 🧠 Summary

This project demonstrates:

* Graph modeling using relational databases
* Backend API design with authentication
* Efficient querying of connected data
* Real-time UI synchronization for dynamic systems
