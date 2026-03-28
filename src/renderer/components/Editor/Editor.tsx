import { useRef, RefObject } from 'react'
import { useCodeMirror } from '../../hooks/useCodeMirror'
import styles from './Editor.module.css'

interface EditorProps {
  content: string
  activeFilePath: string | null
  theme: 'dark' | 'light'
  onChange: (value: string) => void
  scrollRef: RefObject<HTMLDivElement | null>
}

export function Editor({ content, activeFilePath, theme, onChange, scrollRef }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useCodeMirror({
    containerRef,
    content,
    activeFilePath,
    theme,
    onChange,
    scrollRef
  })

  return (
    <div className={styles.editorWrapper} style={{ background: 'var(--bg-editor)' }}>
      <div ref={containerRef} className={styles.cmContainer} />
    </div>
  )
}
