import { useState, useEffect, useRef, useCallback } from 'react'
import MarkdownIt from 'markdown-it'
import { Toolbar } from './components/Toolbar/Toolbar'
import { Layout } from './components/Layout/Layout'
import { useSyncScroll } from './hooks/useSyncScroll'
import { useExport } from './hooks/useExport'

const mdInstance = new MarkdownIt({ html: false, linkify: true, typographer: true })

type Theme = 'dark' | 'light'

export default function App() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null)
  const [markdownContent, setMarkdownContent] = useState<string>('')
  const [isDirty, setIsDirty] = useState(false)

  const editorScrollRef = useRef<HTMLDivElement | null>(null)
  const previewScrollRef = useRef<HTMLDivElement | null>(null)

  useSyncScroll(editorScrollRef, previewScrollRef)
  const { exportHTML, exportPDF } = useExport()

  // ── Initialize theme ────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('md-edit-theme') as Theme | null
    if (stored) {
      applyTheme(stored)
    } else {
      window.electronAPI.getTheme().then((t) => applyTheme(t))
    }
  }, [])

  function applyTheme(t: Theme) {
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)
  }

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    localStorage.setItem('md-edit-theme', next)
  }

  // ── Listen for file:opened (from OS file association or CLI) ─
  useEffect(() => {
    const unsub = window.electronAPI.onFileOpened(({ filePath, content }) => {
      setActiveFilePath(filePath)
      setMarkdownContent(content)
      setIsDirty(false)
    })
    return unsub
  }, [])

  // ── Listen for menu actions ─────────────────────────────────
  useEffect(() => {
    const unsub = window.electronAPI.onMenuAction((action) => {
      if (action === 'openFile') handleOpen()
      if (action === 'save') handleSave()
      if (action === 'toggleTheme') toggleTheme()
      if (action === 'exportHTML') handleExportHTML()
      if (action === 'exportPDF') handleExportPDF()
    })
    return unsub
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilePath, markdownContent, isDirty, theme])

  // ── Sync dirty state to main process (for quit dialog) ──────
  useEffect(() => {
    window.electronAPI.setDirty(isDirty)
  }, [isDirty])

  // ── Drag and drop ────────────────────────────────────────────
  useEffect(() => {
    const onDragOver = (e: DragEvent) => { e.preventDefault(); e.stopPropagation() }
    const onDrop = async (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const file = e.dataTransfer?.files[0]
      if (!file) return
      const filePath = window.electronAPI.getPathForFile(file)
      if (!filePath) return
      const content = await window.electronAPI.readFile(filePath)
      setActiveFilePath(filePath)
      setMarkdownContent(content)
      setIsDirty(false)
    }
    document.addEventListener('dragover', onDragOver)
    document.addEventListener('drop', onDrop)
    return () => {
      document.removeEventListener('dragover', onDragOver)
      document.removeEventListener('drop', onDrop)
    }
  }, [])

  // ── Handlers ─────────────────────────────────────────────────
  const handleOpen = useCallback(async () => {
    const result = await window.electronAPI.openFile()
    if (!result) return
    setActiveFilePath(result.filePath)
    setMarkdownContent(result.content)
    setIsDirty(false)
  }, [])

  const handleSave = useCallback(async () => {
    if (!activeFilePath || !isDirty) return
    await window.electronAPI.writeFile(activeFilePath, markdownContent)
    setIsDirty(false)
  }, [activeFilePath, isDirty, markdownContent])

  const handleContentChange = useCallback((value: string) => {
    setMarkdownContent(value)
    setIsDirty(true)
  }, [])

  const handleExportHTML = useCallback(async () => {
    if (!activeFilePath) return
    const rendered = mdInstance.render(markdownContent)
    await exportHTML(activeFilePath, rendered)
  }, [activeFilePath, markdownContent, exportHTML])

  const handleExportPDF = useCallback(async () => {
    if (!activeFilePath) return
    const rendered = mdInstance.render(markdownContent)
    await exportPDF(activeFilePath, rendered)
  }, [activeFilePath, markdownContent, exportPDF])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--bg-app)'
      }}
    >
      <Toolbar
        filePath={activeFilePath}
        isDirty={isDirty}
        theme={theme}
        onOpen={handleOpen}
        onSave={handleSave}
        onToggleTheme={toggleTheme}
        onExportHTML={handleExportHTML}
        onExportPDF={handleExportPDF}
      />
      <Layout
        content={markdownContent}
        activeFilePath={activeFilePath}
        theme={theme}
        onContentChange={handleContentChange}
        editorScrollRef={editorScrollRef}
        previewScrollRef={previewScrollRef}
      />
    </div>
  )
}
