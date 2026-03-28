const PROSE_CSS = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #24292e; background: #fff; max-width: 800px; margin: 40px auto; padding: 0 24px; }
  h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; line-height: 1.3; }
  h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
  h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
  p { margin: 0 0 1em; }
  a { color: #0366d6; text-decoration: none; }
  a:hover { text-decoration: underline; }
  code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 85%; background: rgba(27,31,35,0.05); padding: 0.2em 0.4em; border-radius: 3px; }
  pre { background: #f6f8fa; padding: 16px; overflow: auto; border-radius: 6px; font-size: 85%; line-height: 1.45; margin: 0 0 1em; }
  pre code { background: none; padding: 0; font-size: inherit; }
  blockquote { margin: 0 0 1em; padding: 0 1em; color: #6a737d; border-left: 4px solid #dfe2e5; }
  ul, ol { padding-left: 2em; margin: 0 0 1em; }
  li { margin: 0.25em 0; }
  table { border-collapse: collapse; margin: 0 0 1em; width: 100%; }
  th, td { border: 1px solid #dfe2e5; padding: 6px 13px; }
  th { font-weight: 600; background: #f6f8fa; }
  tr:nth-child(even) { background: #f6f8fa; }
  img { max-width: 100%; }
  hr { border: none; border-top: 1px solid #eaecef; margin: 1.5em 0; }
`

function assembleHTML(title: string, bodyHTML: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>${PROSE_CSS}</style>
</head>
<body>
${bodyHTML}
</body>
</html>`
}

interface ExportActions {
  exportHTML: (filePath: string | null, renderedHTML: string) => Promise<void>
  exportPDF: (filePath: string | null, renderedHTML: string) => Promise<void>
}

export function useExport(): ExportActions {
  const exportHTML = async (filePath: string | null, renderedHTML: string): Promise<void> => {
    const title = filePath ? filePath.split('/').pop()?.replace(/\.md$/, '') ?? 'export' : 'export'
    const html = assembleHTML(title, renderedHTML)
    const suggestedName = `${title}.html`
    await window.electronAPI.exportHTML(suggestedName, html)
  }

  const exportPDF = async (filePath: string | null, renderedHTML: string): Promise<void> => {
    const title = filePath ? filePath.split('/').pop()?.replace(/\.md$/, '') ?? 'export' : 'export'
    const html = assembleHTML(title, renderedHTML)
    const suggestedName = `${title}.pdf`
    await window.electronAPI.exportPDF(suggestedName, html)
  }

  return { exportHTML, exportPDF }
}
