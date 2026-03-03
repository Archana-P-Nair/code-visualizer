/**
 * Vercel build: generate config.js from environment variables.
 * SOCKET_SERVER_URL = backend URL for real-time collaboration (optional).
 */
const fs = require('fs');
const path = require('path');

const socketUrl = process.env.SOCKET_SERVER_URL || '';
const config = `// Auto-generated at build time
window.SOCKET_SERVER_URL = ${JSON.stringify(socketUrl)};
`;

const outPath = path.join(__dirname, '..', 'config.js');
fs.writeFileSync(outPath, config, 'utf8');
console.log('Generated config.js (SOCKET_SERVER_URL:', socketUrl || 'same origin', ')');
