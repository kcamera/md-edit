export interface ElectronAPI {
  // File operations
  openFile: () => Promise<{ filePath: string; content: string } | null>
  readFile: (filePath: string) => Promise<string>
  writeFile: (filePath: string, content: string) => Promise<void>

  // Export
  exportHTML: (filePath: string, html: string) => Promise<void>
  exportPDF: (filePath: string, html: string) => Promise<void>

  // App
  getTheme: () => Promise<'dark' | 'light'>
  getPathForFile: (file: File) => string

  // Push events (main → renderer), return unsubscribe function
  onFileOpened: (cb: (data: { filePath: string; content: string }) => void) => () => void
  onMenuAction: (cb: (action: string) => void) => () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
