/**
 * WebCraft - Real-time Collaboration Server
 * Uses Express + Socket.io for multi-user code editing (unlimited team size)
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Store session state: { sessionId: { html, css, js, count } }
const sessions = new Map();

// Default content for new sessions
const DEFAULT_STATE = {
  html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My Page</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Start building your website here.</p>
</body>
</html>`,
  css: `/* Your styles go here */
body {
  font-family: system-ui, sans-serif;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #333;
}`,
  js: `// Your JavaScript goes here
console.log('WebCraft is ready!');`,
};

function getOrCreateSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      html: DEFAULT_STATE.html,
      css: DEFAULT_STATE.css,
      js: DEFAULT_STATE.js,
      count: 0,
    });
  }
  return sessions.get(sessionId);
}

function generateSessionId() {
  return Math.random().toString(36).substring(2, 10);
}

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  socket.on('join', (sessionId, callback) => {
    const id = (sessionId || '').trim().toLowerCase();
    if (!id) {
      callback?.({
        ok: false,
        error: 'Please enter a session ID',
      });
      return;
    }

    const session = getOrCreateSession(id);

    socket.join(id);
    session.count += 1;
    socket.sessionId = id;

    callback?.({
      ok: true,
      sessionId: id,
      html: session.html,
      css: session.css,
      js: session.js,
      userCount: session.count,
    });

    socket.to(id).emit('user-joined', { userCount: session.count });
  });

  socket.on('code-update', ({ html, css, js }) => {
    const sessionId = socket.sessionId;
    if (!sessionId) return;

    const session = sessions.get(sessionId);
    if (!session) return;

    session.html = html ?? session.html;
    session.css = css ?? session.css;
    session.js = js ?? session.js;

    socket.to(sessionId).emit('code-update', {
      html: session.html,
      css: session.css,
      js: session.js,
    });
  });

  socket.on('disconnect', () => {
    const sessionId = socket.sessionId;
    if (!sessionId) return;

    const session = sessions.get(sessionId);
    if (session) {
      session.count = Math.max(0, session.count - 1);
      io.to(sessionId).emit('user-left', { userCount: session.count });
    }
  });
});

server.listen(PORT, () => {
  console.log(`WebCraft server running at http://localhost:${PORT}`);
  console.log(`Real-time collaboration: share a session ID with your team.`);
});
