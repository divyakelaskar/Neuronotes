# Neuronotes

A visual, markdown-powered note-taking application that organizes your thoughts as an interactive knowledge graph. Create, connect, and visualize your notes in a dynamic network where each node represents a note and links represent relationships.

[![Youtube video redirect link](http://img.youtube.com/vi/pI4hRxJRlJE/maxresdefault.jpg)](http://www.youtube.com/watch?vpI4hRxJRlJE "Youtube video redirect link")

## ✨ Features

- **Interactive Knowledge Graph** - Visualize your notes as an interconnected network using an interactive force-directed graph
- **Markdown Support** - Write notes in Markdown with live preview, syntax highlighting, and GitHub Flavored Markdown support
- **Hierarchical Organization** - Create parent-child relationships between notes to build structured knowledge trees
- **Real-time Graph Updates** - Watch your knowledge graph grow and reorganize as you create and edit notes
- **Split-pane Editor** - Simultaneously edit and preview your markdown with synchronized scrolling
- **Responsive Design** - Clean, modern UI that works across devices

## 🚀 Tech Stack

- **Frontend**: React 18, React Router v6
- **Visualization**: react-force-graph-2d
- **Styling**: Tailwind CSS
- **Markdown**: react-markdown with remark-gfm
- **Code Highlighting**: react-syntax-highlighter
- **HTTP Client**: Axios

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/neuronotes.git
cd neuronotes
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

## 🏗️ Project Structure

```
src/
├── pages/
│   ├── Home.jsx          # Main graph view
│   ├── Landing.jsx       # Landing page
│   └── LoginSignup.jsx   # Authentication page
├── components/
│   ├── Navbar.jsx        # Navigation with create/logout
│   ├── NoteModal.jsx     # Markdown editor with preview
│   └── CreateNodeModal.jsx # Node creation dialog
├── utils/
│   └── api.js            # Axios instance with auth interceptor
├── ProtectedRoute.jsx    # Route protection wrapper
└── App.jsx               # Main router configuration
```

## 🎯 Core Functionality

### Knowledge Graph Visualization
- Nodes represent individual notes
- Links represent parent-child relationships
- Root nodes (notes without parents) appear larger
- Click any node to open and edit its content

### Note Management
- Create new notes with optional parent relationships
- Edit notes with real-time Markdown preview
- Delete notes with confirmation
- Reorganize notes by changing parent relationships

### Markdown Features
- Headers (h1, h2, h3)
- Lists (ordered and unordered)
- Blockquotes
- Tables with styling
- Code blocks with syntax highlighting
- Images
- GitHub Flavored Markdown support

## 🔐 Authentication

The app uses JWT-based authentication:
- Login/Register through the `/auth` route
- Protected routes redirect unauthorized users
- Tokens stored in localStorage
- Automatic token refresh on expiration

## 🖥️ API Integration

Expected backend endpoints:

```
GET    /graph           - Fetch all nodes and links
GET    /notes/:id       - Fetch single note
POST   /notes           - Create new note
PUT    /notes/:id       - Update note
DELETE /notes/:id       - Delete note
POST   /auth/login      - User login
POST   /auth/register   - User registration
POST   /auth/refresh    - Refresh access token
```

## 🎨 UI/UX Highlights

- **Smooth Animations** - Modal transitions and graph interactions
- **Keyboard Shortcuts** - Enter to create node, Escape to close modals
- **Scroll Sync** - Editor and preview scrolling stay in sync
- **Visual Feedback** - Hover effects, shadows, and scaling transforms
- **Dark/Light Mode** - Clean, readable interface with proper contrast

## 🙏 Acknowledgments

- [react-force-graph](https://github.com/vasturiano/react-force-graph) for the amazing visualization library
- [Tailwind CSS](https://tailwindcss.com) for the utility-first styling
- [React Markdown](https://github.com/remarkjs/react-markdown) for markdown rendering

---

**Built with ❤️ for knowledge workers and visual thinkers**
