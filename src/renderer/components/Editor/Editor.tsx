import { useRef, RefObject, forwardRef, useImperativeHandle } from 'react'
import { useCodeMirror } from '../../hooks/useCodeMirror'
import styles from './Editor.module.css'

export interface EditorHandle {
  undo: () => void
  redo: () => void
}

interface EditorProps {
  content: string
  activeFilePath: string | null
  theme: 'dark' | 'light'
  onChange: (value: string) => void
  onUndoRedoChange: (canUndo: boolean, canRedo: boolean) => void
  scrollRef: RefObject<HTMLDivElement | null>
}

export const Editor = forwardRef<EditorHandle, EditorProps>(function Editor(
  { content, activeFilePath, theme, onChange, onUndoRedoChange, scrollRef },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { triggerUndo, triggerRedo } = useCodeMirror({
    containerRef,
    content,
    activeFilePath,
    theme,
    onChange,
    onUndoRedoChange,
    scrollRef
  })

  useImperativeHandle(ref, () => ({
    undo: triggerUndo,
    redo: triggerRedo
  }))

  return (
    <div className={styles.editorWrapper} style={{ background: 'var(--bg-editor)' }}>
      <div ref={containerRef} className={styles.cmContainer} />
    </div>
  )
})
