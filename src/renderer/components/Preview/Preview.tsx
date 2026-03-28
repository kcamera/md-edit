import { useMemo, RefObject } from 'react'
import MarkdownIt from 'markdown-it'
import './preview.css'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
})

interface PreviewProps {
  content: string
  scrollRef: RefObject<HTMLDivElement | null>
}

export function Preview({ content, scrollRef }: PreviewProps) {
  const rendered = useMemo(() => md.render(content), [content])

  if (!content) {
    return (
      <div className="previewWrapper" ref={scrollRef}>
        <div className="emptyState">
          <span>Open a markdown file to get started</span>
          <span style={{ fontSize: '12px', opacity: 0.6 }}>File → Open or drag a file here</span>
        </div>
      </div>
    )
  }

  return (
    <div className="previewWrapper" ref={scrollRef}>
      <div
        className="previewBody"
        dangerouslySetInnerHTML={{ __html: rendered }}
      />
    </div>
  )
}
