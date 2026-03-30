import { useState, useRef, useEffect } from 'react'
import styles from './Toolbar.module.css'

const isMac = navigator.userAgent.includes('Macintosh')

interface ToolbarProps {
  filePath: string | null
  isDirty: boolean
  canUndo: boolean
  canRedo: boolean
  theme: 'dark' | 'light'
  onOpen: () => void
  onSave: () => void
  onUndo: () => void
  onRedo: () => void
  onToggleTheme: () => void
  onExportHTML: () => void
  onExportPDF: () => void
}

export function Toolbar({
  filePath,
  isDirty,
  canUndo,
  canRedo,
  theme,
  onOpen,
  onSave,
  onUndo,
  onRedo,
  onToggleTheme,
  onExportHTML,
  onExportPDF
}: ToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  const fileName = filePath ? filePath.split('/').pop() : null

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className={styles.toolbar} style={isMac ? { paddingLeft: 80 } : undefined}>
      <div className={styles.left}>
        <button className={styles.btn} onClick={onOpen} title="Open file (Cmd+O)">
          Open
        </button>
        <button className={styles.btn} onClick={onUndo} disabled={!canUndo} title="Undo (Cmd+Z)">
          ↩
        </button>
        <button className={styles.btn} onClick={onRedo} disabled={!canRedo} title="Redo (Cmd+Shift+Z)">
          ↪
        </button>
      </div>

      <div className={styles.center}>
        {fileName ? (
          <span className={styles.fileName}>
            {fileName}
            {isDirty && <span className={styles.dirty}>•</span>}
          </span>
        ) : (
          <span className={styles.fileNameEmpty}>No file open</span>
        )}
      </div>

      <div className={styles.right}>
        <button
          className={styles.btn}
          onClick={onSave}
          disabled={!filePath || !isDirty}
          title="Save (Cmd+S)"
        >
          Save
        </button>

        <div className={styles.exportWrapper} ref={exportRef}>
          <button
            className={styles.btn}
            onClick={() => setExportOpen((v) => !v)}
            disabled={!filePath}
            title="Export"
          >
            Export ▾
          </button>
          {exportOpen && (
            <div className={styles.dropdown}>
              <button
                className={styles.dropdownItem}
                onClick={() => { onExportHTML(); setExportOpen(false) }}
              >
                Export as HTML
              </button>
              <button
                className={styles.dropdownItem}
                onClick={() => { onExportPDF(); setExportOpen(false) }}
              >
                Export as PDF
              </button>
            </div>
          )}
        </div>

        <button
          className={styles.btn}
          onClick={onToggleTheme}
          title="Toggle theme (Cmd+Shift+T)"
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>
    </div>
  )
}
