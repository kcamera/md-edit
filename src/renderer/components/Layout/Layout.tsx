import { useState, useCallback, RefObject, Ref } from 'react'
import { Editor, EditorHandle } from '../Editor/Editor'
import { Preview } from '../Preview/Preview'
import { ResizeHandle } from './ResizeHandle'
import styles from './Layout.module.css'

interface LayoutProps {
  content: string
  activeFilePath: string | null
  theme: 'dark' | 'light'
  onContentChange: (value: string) => void
  onUndoRedoChange: (canUndo: boolean, canRedo: boolean) => void
  editorRef: Ref<EditorHandle>
  editorScrollRef: RefObject<HTMLDivElement | null>
  previewScrollRef: RefObject<HTMLDivElement | null>
}

export function Layout({
  content,
  activeFilePath,
  theme,
  onContentChange,
  onUndoRedoChange,
  editorRef,
  editorScrollRef,
  previewScrollRef
}: LayoutProps) {
  const [editorWidthPct, setEditorWidthPct] = useState(50)

  const handleResize = useCallback((deltaX: number) => {
    setEditorWidthPct((prev) => {
      const containerWidth = document.documentElement.clientWidth
      const deltaPct = (deltaX / containerWidth) * 100
      return Math.max(20, Math.min(80, prev + deltaPct))
    })
  }, [])

  return (
    <div className={styles.layout}>
      <div className={styles.pane} style={{ width: `${editorWidthPct}%` }}>
        <Editor
          ref={editorRef}
          content={content}
          activeFilePath={activeFilePath}
          theme={theme}
          onChange={onContentChange}
          onUndoRedoChange={onUndoRedoChange}
          scrollRef={editorScrollRef}
        />
      </div>
      <ResizeHandle onResize={handleResize} />
      <div className={styles.pane} style={{ flex: 1 }}>
        <Preview content={content} scrollRef={previewScrollRef} />
      </div>
    </div>
  )
}
