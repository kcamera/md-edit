import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI } from '../shared/types'

const api: ElectronAPI = {
  openFile: () => ipcRenderer.invoke('file:open'),

  readFile: (filePath: string) => ipcRenderer.invoke('file:read', filePath),

  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('file:write', filePath, content),

  exportHTML: (filePath: string, html: string) =>
    ipcRenderer.invoke('export:html', filePath, html),

  exportPDF: (filePath: string, html: string) =>
    ipcRenderer.invoke('export:pdf', filePath, html),

  getTheme: () => ipcRenderer.invoke('app:getTheme'),

  onFileOpened: (cb) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { filePath: string; content: string }) =>
      cb(data)
    ipcRenderer.on('file:opened', handler)
    return () => ipcRenderer.removeListener('file:opened', handler)
  },

  onMenuAction: (cb) => {
    const handler = (_event: Electron.IpcRendererEvent, action: string) => cb(action)
    ipcRenderer.on('menu:action', handler)
    return () => ipcRenderer.removeListener('menu:action', handler)
  }
}

contextBridge.exposeInMainWorld('electronAPI', api)
