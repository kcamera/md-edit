import { useCallback } from 'react'
import styles from './Layout.module.css'

interface ResizeHandleProps {
  onResize: (deltaX: number) => void
}

export function ResizeHandle({ onResize }: ResizeHandleProps) {
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const startX = e.clientX

      const onMouseMove = (moveEvent: MouseEvent) => {
        onResize(moveEvent.clientX - startX)
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [onResize]
  )

  return <div className={styles.resizeHandle} onMouseDown={onMouseDown} />
}
