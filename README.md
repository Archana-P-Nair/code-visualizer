# WebCraft — HTML, CSS & JavaScript Playground

A lightweight code editor for building websites with live preview and **real-time collaboration**. Write HTML, CSS, and JavaScript in separate panels and see your site render in real time. Share a session ID with your team (up to 5 people) and watch changes sync instantly.

## Features

- **Split view**: Code on the left, live preview on the right
- **Tabs**: Switch between HTML, CSS, and JavaScript editors
- **Syntax highlighting**: Powered by Ace Editor (Monokai theme)
- **Live preview**: Updates as you type (can be toggled off)
- **Run button**: Manually refresh the preview anytime
- **Open in new tab**: Export and view your page in a separate tab
- **Resizable panels**: Drag the divider to adjust editor/preview sizes
- **Real-time collaboration**: Share a session ID with your team—everyone sees changes instantly

## How to Run

### For collaboration (recommended)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open `http://localhost:3000` in your browser.

### Solo / offline

- Open `index.html` directly and choose **Work Solo** (no server needed).

## Real-time Collaboration

1. Start the server with `npm start`.
2. Open the app in your browser.
3. **Create New Session** — generates a unique session ID and copies it to your clipboard.
4. Share the session ID with your team (e.g. `abc123xy`).
5. Teammates enter the same ID and click **Join Session**.
6. Everyone in the session sees the same code and updates in real time.

**Work Solo** — Use the editor without connecting to a session (no server required).

## Usage

- **HTML tab**: Write your page structure. Full documents or fragments both work.
- **CSS tab**: Add styles. They are injected into the page automatically.
- **JavaScript tab**: Add scripts. They run after the HTML loads.
- **Live toggle**: Turn on for auto-updates as you type, off to update only when you click **Run**.

## Tech Stack

- Vanilla HTML, CSS, JavaScript
- [Ace Editor](https://ace.c9.io/) for syntax highlighting (loaded via CDN)
- [Socket.io](https://socket.io/) for real-time collaboration
- [Express](https://expressjs.com/) for the Node.js server

## Browser Support

Works in modern browsers that support `iframe.srcdoc` and ES6+.

## License

MIT
