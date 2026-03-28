import { useEffect, useRef, RefObject } from 'react'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { defaultKeymap, historyKeymap, history } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { languages } from '@codemirror/language-data'
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'

const themeCompartment = new Compartment()
const docCompartment = new Compartment()

function getLightTheme() {
  return EditorView.theme(
    {
      '&': {
        backgroundColor: 'var(--bg-editor)',
        color: '#1e1e1e',
        height: '100%'
      },
      '.cm-content': {
        caretColor: '#333',
        padding: '16px 0'
      },
      '.cm-line': {
        padding: '0 16px'
      },
      '.cm-gutters': {
        backgroundColor: '#f0f0f0',
        color: '#999',
        border: 'none',
        borderRight: '1px solid #ddd'
      },
      '.cm-activeLineGutter': {
        backgroundColor: '#e8e8e8'
      },
      '.cm-activeLine': {
        backgroundColor: 'rgba(0,0,0,0.04)'
      },
      '.cm-cursor': {
        borderLeftColor: '#333'
      },
      '.cm-selectionBackground': {
        backgroundColor: '#b5d5fb !important'
      },
      '&.cm-focused .cm-selectionBackground': {
        backgroundColor: '#a8d4fa !important'
      }
    },
    { dark: false }
  )
}

function getDarkTheme() {
  return [
    oneDark,
    EditorView.theme({
      '&': { height: '100%' },
      '.cm-content': { padding: '16px 0' },
      '.cm-line': { padding: '0 16px' }
    })
  ]
}

interface UseCodeMirrorOptions {
  containerRef: RefObject<HTMLDivElement | null>
  content: string
  activeFilePath: string | null
  theme: 'dark' | 'light'
  onChange: (value: string) => void
  scrollRef: RefObject<HTMLDivElement | null>
}

export function useCodeMirror({
  containerRef,
  content,
  activeFilePath,
  theme,
  onChange,
  scrollRef
}: UseCodeMirrorOptions): void {
  const viewRef = useRef<EditorView | null>(null)
  const lastFilePathRef = useRef<string | null>(null)

  // Create the editor on mount
  useEffect(() => {
    if (!containerRef.current) return

    const themeExt = theme === 'dark' ? getDarkTheme() : getLightTheme()

    const startState = EditorState.create({
      doc: content,
      extensions: [
        history(),
        lineNumbers(),
        highlightActiveLine(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        themeCompartment.of(themeExt),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
        EditorView.lineWrapping
      ]
    })

    const view = new EditorView({
      state: startState,
      parent: containerRef.current
    })

    viewRef.current = view
    lastFilePathRef.current = activeFilePath
    scrollRef.current = view.scrollDOM as HTMLDivElement

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When a new file is opened, replace document content entirely
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    if (activeFilePath === lastFilePathRef.current) return

    lastFilePathRef.current = activeFilePath

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: content }
    })
    view.scrollDOM.scrollTop = 0
  }, [activeFilePath, content])

  // Swap theme via compartment (no editor recreation)
  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    const themeExt = theme === 'dark' ? getDarkTheme() : getLightTheme()
    view.dispatch({
      effects: themeCompartment.reconfigure(themeExt)
    })
  }, [theme])
}
