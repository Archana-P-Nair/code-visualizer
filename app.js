/**
 * WebCraft - HTML, CSS & JavaScript Code Editor with Live Preview
 * Real-time collaboration via Socket.io (unlimited team size)
 */

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My Page</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Start building your website here.</p>
</body>
</html>`;

const DEFAULT_CSS = `/* Your styles go here */
body {
  font-family: system-ui, sans-serif;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #333;
}`;

const DEFAULT_JS = `// Your JavaScript goes here
console.log('WebCraft is ready!');`;

// ===== COLLABORATION STATE =====
let socket = null;
let currentSessionId = null;
let isApplyingRemote = false;
let editorsInitialized = false;

// ===== ACE EDITORS =====
let htmlEditor, cssEditor, jsEditor;

function initEditors(initialState = null) {
  if (editorsInitialized) {
    applyRemoteUpdate(initialState || {
      html: DEFAULT_HTML,
      css: DEFAULT_CSS,
      js: DEFAULT_JS,
    });
    return;
  }
  editorsInitialized = true;
  const ace = window.ace;
  if (!ace) {
    console.error('Ace Editor failed to load');
    return;
  }

  const html = initialState?.html ?? DEFAULT_HTML;
  const css = initialState?.css ?? DEFAULT_CSS;
  const js = initialState?.js ?? DEFAULT_JS;

  htmlEditor = ace.edit('html-editor');
  htmlEditor.setTheme('ace/theme/monokai');
  htmlEditor.session.setMode('ace/mode/html');
  htmlEditor.setValue(html, 1);
  htmlEditor.setOptions({
    fontSize: '13px',
    tabSize: 2,
    useSoftTabs: true,
    showPrintMargin: false,
    highlightActiveLine: true,
  });

  cssEditor = ace.edit('css-editor');
  cssEditor.setTheme('ace/theme/monokai');
  cssEditor.session.setMode('ace/mode/css');
  cssEditor.setValue(css, 1);
  cssEditor.setOptions({
    fontSize: '13px',
    tabSize: 2,
    useSoftTabs: true,
    showPrintMargin: false,
    highlightActiveLine: true,
  });

  jsEditor = ace.edit('js-editor');
  jsEditor.setTheme('ace/theme/monokai');
  jsEditor.session.setMode('ace/mode/javascript');
  jsEditor.setValue(js, 1);
  jsEditor.setOptions({
    fontSize: '13px',
    tabSize: 2,
    useSoftTabs: true,
    showPrintMargin: false,
    highlightActiveLine: true,
  });

  const debounce = (fn, ms) => {
    let id;
    return () => {
      clearTimeout(id);
      id = setTimeout(fn, ms);
    };
  };

  const updatePreview = debounce(runPreview, 400);
  const emitUpdate = debounce(emitCodeUpdate, 300);

  function onEditorChange() {
    updatePreview();
    if (currentSessionId && socket?.connected) {
      emitUpdate();
    }
  }

  htmlEditor.session.on('change', onEditorChange);
  cssEditor.session.on('change', onEditorChange);
  jsEditor.session.on('change', onEditorChange);
}

function emitCodeUpdate() {
  if (!socket?.connected || !currentSessionId || isApplyingRemote) return;
  socket.emit('code-update', {
    html: htmlEditor?.getValue() ?? '',
    css: cssEditor?.getValue() ?? '',
    js: jsEditor?.getValue() ?? '',
  });
}

function applyRemoteUpdate({ html, css, js }) {
  if (!htmlEditor || !cssEditor || !jsEditor) return;
  isApplyingRemote = true;
  if (html != null) htmlEditor.setValue(html, 1);
  if (css != null) cssEditor.setValue(css, 1);
  if (js != null) jsEditor.setValue(js, 1);
  runPreview(true);
  // Keep flag set longer than debounce (300ms) so change events from setValue don't trigger a re-emit
  setTimeout(() => { isApplyingRemote = false; }, 400);
}

// ===== SESSION UI =====
function showSessionOverlay() {
  document.getElementById('sessionOverlay')?.classList.remove('hidden');
  document.getElementById('sessionInfo')?.classList.remove('visible');
  document.getElementById('sessionError').textContent = '';
}

function hideSessionOverlay() {
  document.getElementById('sessionOverlay')?.classList.add('hidden');
}

function showSessionInfo(sessionId, userCount) {
  hideSessionOverlay();
  const info = document.getElementById('sessionInfo');
  const badge = document.getElementById('sessionBadge');
  const countEl = document.getElementById('userCount');
  if (badge) badge.textContent = sessionId;
  if (countEl) countEl.textContent = userCount;
  info?.classList.add('visible');
}

function updateUserCount(count) {
  const el = document.getElementById('userCount');
  if (el) el.textContent = count;
}

function generateSessionId() {
  return Math.random().toString(36).substring(2, 10);
}

// ===== SOCKET & SESSION LOGIC =====
function connectAndJoin(sessionId, callback) {
  if (socket) {
    socket.disconnect();
  }
  socket = window.io?.();
  if (!socket) {
    callback?.({ ok: false, error: 'Socket.io not loaded' });
    return;
  }
  socket.on('connect', () => {
    socket.emit('join', sessionId, (res) => {
      if (res?.ok) {
        socket.sessionId = res.sessionId;
        currentSessionId = res.sessionId;
        showSessionInfo(res.sessionId, res.userCount ?? 1);
        initEditors({ html: res.html, css: res.css, js: res.js });
        setTimeout(runPreview, 100);
        callback?.({ ok: true, ...res });
      } else {
        callback?.({ ok: false, error: res?.error ?? 'Join failed' });
      }
    });
  });
  socket.on('code-update', applyRemoteUpdate);
  socket.on('user-joined', (data) => updateUserCount(data?.userCount ?? 0));
  socket.on('user-left', (data) => updateUserCount(data?.userCount ?? 0));
}

function leaveSession() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentSessionId = null;
  document.getElementById('sessionInfo')?.classList.remove('visible');
  showSessionOverlay();
}

function startSolo() {
  currentSessionId = null;
  socket = null;
  hideSessionOverlay();
  initEditors(null);
  setTimeout(runPreview, 100);
}

// ===== BUILD OUTPUT =====
function getFullDocument() {
  const html = htmlEditor?.getValue() || '';
  const css = cssEditor?.getValue() || '';
  const js = jsEditor?.getValue() || '';

  const hasStructure = /<(html|!DOCTYPE|head|body)/i.test(html.trim());

  if (hasStructure) {
    let result = html;
    if (css.trim()) {
      const styleTag = `<style>\n${css.trim()}\n</style>`;
      if (/<\/head>/i.test(result)) {
        result = result.replace(/<\/head>/i, styleTag + '\n</head>');
      } else if (/<\/html>/i.test(result)) {
        result = result.replace(/<\/html>/i, styleTag + '\n</html>');
      } else {
        result = styleTag + '\n' + result;
      }
    }
    if (js.trim()) {
      const scriptTag = `<script>\n${js.trim()}\n</script>`;
      if (/<\/body>/i.test(result)) {
        result = result.replace(/<\/body>/i, scriptTag + '\n</body>');
      } else {
        result += '\n' + scriptTag;
      }
    }
    return result;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
${css.trim() || '/* no styles */'}
  </style>
</head>
<body>
${html.trim() || '<!-- content -->'}
  <script>
${js.trim() || '// no scripts'}
  </script>
</body>
</html>`;
}

function runPreview(force = false) {
  const liveCheckbox = document.getElementById('livePreview');
  if (!force && liveCheckbox && !liveCheckbox.checked) return;

  const iframe = document.getElementById('preview');
  if (!iframe || !htmlEditor) return;

  const doc = getFullDocument();
  iframe.srcdoc = doc;

  const openLink = document.getElementById('openInNew');
  if (openLink) {
    const blob = new Blob([doc], { type: 'text/html' });
    openLink.href = URL.createObjectURL(blob);
  }
}

// ===== TABS =====
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const editors = {
    html: document.getElementById('html-editor'),
    css: document.getElementById('css-editor'),
    js: document.getElementById('js-editor'),
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      tabs.forEach((t) => t.classList.remove('active'));
      Object.values(editors).forEach((el) => el.classList.add('hidden'));
      tab.classList.add('active');
      editors[tabId].classList.remove('hidden');
    });
  });
}

// ===== RUN BUTTON =====
function initRunButton() {
  document.getElementById('runBtn')?.addEventListener('click', () => runPreview(true));
}

// ===== DOWNLOAD ZIP =====
function downloadAsZip() {
  if (!window.JSZip || !htmlEditor || !cssEditor || !jsEditor) return;

  const zip = new JSZip();

  zip.file('index.html', htmlEditor.getValue());
  zip.file('style.css', cssEditor.getValue());
  zip.file('script.js', jsEditor.getValue());

  zip.generateAsync({ type: 'blob' }).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webcraft-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

function initDownloadButton() {
  document.getElementById('downloadBtn')?.addEventListener('click', downloadAsZip);
}

// ===== LIVE TOGGLE =====
function initLiveToggle() {
  document.getElementById('livePreview')?.addEventListener('change', () => {
    if (document.getElementById('livePreview').checked) runPreview();
  });
}

// ===== RESIZER =====
function initResizer() {
  const resizer = document.getElementById('resizer');
  const editorPanel = document.querySelector('.editor-panel');
  const previewPanel = document.querySelector('.preview-panel');

  if (!resizer || !editorPanel || !previewPanel) return;

  let isDragging = false;
  let startX, startWidth;

  resizer.addEventListener('mousedown', (e) => {
    isDragging = true;
    resizer.classList.add('dragging');
    startX = e.clientX;
    startWidth = editorPanel.offsetWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const newWidth = Math.max(200, Math.min(window.innerWidth - 250, startWidth + dx));
    editorPanel.style.flex = `0 0 ${newWidth}px`;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      resizer.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
}

// ===== SESSION EVENT HANDLERS =====
function initSessionHandlers() {
  const overlay = document.getElementById('sessionOverlay');
  const input = document.getElementById('sessionIdInput');
  const errorEl = document.getElementById('sessionError');

  document.getElementById('joinBtn')?.addEventListener('click', () => {
    const id = (input?.value || '').trim();
    errorEl.textContent = '';
    if (!id) {
      errorEl.textContent = 'Please enter a session ID';
      return;
    }
    connectAndJoin(id, (res) => {
      if (!res.ok) {
        errorEl.textContent = res.error ?? 'Failed to join';
      }
    });
  });

  document.getElementById('createBtn')?.addEventListener('click', () => {
    const id = generateSessionId();
    input.value = id;
    errorEl.textContent = '';
    connectAndJoin(id, (res) => {
      if (!res.ok) {
        errorEl.textContent = res.error ?? 'Failed to create';
      } else {
        input.select();
        navigator.clipboard?.writeText(id);
      }
    });
  });

  document.getElementById('soloBtn')?.addEventListener('click', () => {
    startSolo();
  });

  document.getElementById('copyBtn')?.addEventListener('click', () => {
    if (currentSessionId) {
      navigator.clipboard?.writeText(currentSessionId);
    }
  });

  document.getElementById('leaveBtn')?.addEventListener('click', () => {
    leaveSession();
  });

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('joinBtn')?.click();
  });
}

// ===== INIT =====
function init() {
  initTabs();
  initRunButton();
  initLiveToggle();
  initResizer();
  initDownloadButton();
  initSessionHandlers();

  showSessionOverlay();
}

init();
