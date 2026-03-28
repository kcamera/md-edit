const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const btnTogglePreview = document.getElementById('btn-toggle-preview');

// Configure marked
marked.setOptions({ breaks: true, gfm: true });

// Render markdown to preview
function render() {
  preview.innerHTML = marked.parse(editor.value);
}

editor.addEventListener('input', render);

// Toolbar helpers
function wrap(before, after = before) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const sel = editor.value.slice(start, end);
  const replacement = before + (sel || 'text') + after;
  editor.setRangeText(replacement, start, end, 'select');
  editor.focus();
  render();
}

function insertLine(prefix) {
  const start = editor.selectionStart;
  const lineStart = editor.value.lastIndexOf('\n', start - 1) + 1;
  editor.setRangeText(prefix, lineStart, lineStart, 'end');
  editor.focus();
  render();
}

document.getElementById('btn-bold').addEventListener('click', () => wrap('**'));
document.getElementById('btn-italic').addEventListener('click', () => wrap('_'));
document.getElementById('btn-heading').addEventListener('click', () => insertLine('## '));
document.getElementById('btn-link').addEventListener('click', () => {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const sel = editor.value.slice(start, end) || 'link text';
  editor.setRangeText(`[${sel}](url)`, start, end, 'end');
  editor.focus();
  render();
});
document.getElementById('btn-code').addEventListener('click', () => {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const sel = editor.value.slice(start, end);
  if (sel.includes('\n')) {
    wrap('```\n', '\n```');
  } else {
    wrap('`');
  }
});

// Toggle preview-only mode
btnTogglePreview.addEventListener('click', () => {
  document.body.classList.toggle('preview-only');
  btnTogglePreview.textContent = document.body.classList.contains('preview-only')
    ? '✏ Edit'
    : '▶ Preview';
});

// Persist content in localStorage
const STORAGE_KEY = 'md-edit-content';

const saved = localStorage.getItem(STORAGE_KEY);
if (saved !== null) {
  editor.value = saved;
} else {
  editor.value = `# Hello, md-edit

Start writing **markdown** here and see the preview update live.

## Features
- Live preview
- Toolbar shortcuts
- Persists across reloads

> Built with vibes ✨
`;
}

editor.addEventListener('input', () => {
  localStorage.setItem(STORAGE_KEY, editor.value);
});

// Initial render
render();
