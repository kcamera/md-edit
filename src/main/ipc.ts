import { ipcMain, dialog, BrowserWindow, nativeTheme } from 'electron'
import fs from 'fs'
import path from 'path'
import { getMainWindow, openFile } from './index'

export function registerIpcHandlers(): void {
  // Open file via native dialog
  ipcMain.handle('file:open', async () => {
    const win = getMainWindow()
    if (!win) return null

    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (result.canceled || result.filePaths.length === 0) return null

    const filePath = result.filePaths[0]
    const content = fs.readFileSync(filePath, 'utf-8')
    return { filePath, content }
  })

  // Read a file by path
  ipcMain.handle('file:read', async (_event, filePath: string) => {
    return fs.readFileSync(filePath, 'utf-8')
  })

  // Write/save a file
  ipcMain.handle('file:write', async (_event, filePath: string, content: string) => {
    fs.writeFileSync(filePath, content, 'utf-8')
  })

  // Update window title
  ipcMain.handle('app:setTitle', async (_event, title: string) => {
    const win = getMainWindow()
    if (win) win.setTitle(title)
  })

  // Get system theme preference
  ipcMain.handle('app:getTheme', async () => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  })

  // Export to HTML: show save dialog, write file
  ipcMain.handle('export:html', async (_event, suggestedName: string, html: string) => {
    const win = getMainWindow()
    if (!win) return

    const result = await dialog.showSaveDialog(win, {
      defaultPath: suggestedName,
      filters: [{ name: 'HTML', extensions: ['html'] }]
    })

    if (result.canceled || !result.filePath) return
    fs.writeFileSync(result.filePath, html, 'utf-8')
  })

  // Export to PDF: hidden window approach for clean output
  ipcMain.handle('export:pdf', async (_event, suggestedName: string, html: string) => {
    const win = getMainWindow()
    if (!win) return

    const result = await dialog.showSaveDialog(win, {
      defaultPath: suggestedName,
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    })

    if (result.canceled || !result.filePath) return

    const pdfWin = new BrowserWindow({
      show: false,
      webPreferences: { offscreen: true }
    })

    const dataURL = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
    await pdfWin.loadURL(dataURL)

    const buffer = await pdfWin.webContents.printToPDF({
      printBackground: true,
      pageSize: 'Letter'
    })

    fs.writeFileSync(result.filePath, buffer)
    pdfWin.destroy()
  })

  // Handle menu-triggered open (from menu.ts)
  ipcMain.handle('menu:openFile', async () => {
    const win = getMainWindow()
    if (!win) return

    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (!result.canceled && result.filePaths.length > 0) {
      openFile(result.filePaths[0])
    }
  })
}
