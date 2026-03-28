import { useEffect, useRef, RefObject } from 'react'

export function useSyncScroll(
  editorScrollRef: RefObject<HTMLDivElement | null>,
  previewScrollRef: RefObject<HTMLDivElement | null>
): void {
  const isScrollingFrom = useRef<'editor' | 'preview' | null>(null)

  useEffect(() => {
    const getScrollPct = (el: HTMLDivElement): number => {
      const max = el.scrollHeight - el.clientHeight
      if (max <= 0) return 0
      return el.scrollTop / max
    }

    const applyScrollPct = (el: HTMLDivElement, pct: number): void => {
      const max = el.scrollHeight - el.clientHeight
      el.scrollTop = pct * max
    }

    const onEditorScroll = (): void => {
      if (isScrollingFrom.current === 'preview') return
      const editorEl = editorScrollRef.current
      const previewEl = previewScrollRef.current
      if (!editorEl || !previewEl) return

      isScrollingFrom.current = 'editor'
      applyScrollPct(previewEl, getScrollPct(editorEl))
      requestAnimationFrame(() => {
        isScrollingFrom.current = null
      })
    }

    const onPreviewScroll = (): void => {
      if (isScrollingFrom.current === 'editor') return
      const editorEl = editorScrollRef.current
      const previewEl = previewScrollRef.current
      if (!editorEl || !previewEl) return

      isScrollingFrom.current = 'preview'
      applyScrollPct(editorEl, getScrollPct(previewEl))
      requestAnimationFrame(() => {
        isScrollingFrom.current = null
      })
    }

    // Refs may not be populated yet; use a small poll to attach once available
    let editorAttached = false
    let previewAttached = false

    const tryAttach = (): void => {
      if (!editorAttached && editorScrollRef.current) {
        editorScrollRef.current.addEventListener('scroll', onEditorScroll, { passive: true })
        editorAttached = true
      }
      if (!previewAttached && previewScrollRef.current) {
        previewScrollRef.current.addEventListener('scroll', onPreviewScroll, { passive: true })
        previewAttached = true
      }
    }

    tryAttach()
    const interval = setInterval(() => {
      tryAttach()
      if (editorAttached && previewAttached) clearInterval(interval)
    }, 100)

    return () => {
      clearInterval(interval)
      editorScrollRef.current?.removeEventListener('scroll', onEditorScroll)
      previewScrollRef.current?.removeEventListener('scroll', onPreviewScroll)
    }
  }, [editorScrollRef, previewScrollRef])
}
