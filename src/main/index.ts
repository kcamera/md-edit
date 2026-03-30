import { app, BrowserWindow, nativeTheme, dialog } from 'electron'
import { join } from 'path'

app.setPath('userData', join(app.getPath('cache'), 'md-edit'))
import fs from 'fs'
import { registerIpcHandlers } from './ipc'
import { buildMenu } from './menu'

let mainWindow: BrowserWindow | null = null
let pendingFilePath: string | null = null
let isDirty = false

export function setDirty(value: boolean): void {
  isDirty = value
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 500,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1e1e1e' : '#f3f3f3',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  // Linux/Windows only: start with menubar hidden, Alt key peeks it
  if (process.platform !== 'darwin') {
    mainWindow.setMenuBarVisibility(false)
    mainWindow.setAutoHideMenuBar(true)
  }

  mainWindow.on('close', async (event) => {
    if (!isDirty) return

    event.preventDefault()

    const { response } = await dialog.showMessageBox(mainWindow!, {
      type: 'warning',
      message: 'You have unsaved changes.',
      detail: 'Do you want to save before closing?',
      buttons: ['Save', "Don't Save", 'Cancel'],
      defaultId: 0,
      cancelId: 2
    })

    if (response === 0) {
      // Save — ask the renderer to save, then close
      mainWindow!.webContents.send('menu:action', 'save')
      // Give the renderer a moment to write, then close for real
      setTimeout(() => {
        isDirty = false
        mainWindow?.close()
      }, 500)
    } else if (response === 1) {
      // Don't Save — close without saving
      isDirty = false
      mainWindow!.close()
    }
    // response === 2 (Cancel): do nothing, window stays open
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

export function openFile(filePath: string): void {
  if (!mainWindow) return
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    mainWindow.webContents.send('file:opened', { filePath, content })
    const fileName = filePath.split('/').pop() ?? filePath
    mainWindow.setTitle(`${fileName} — md-edit`)
  } catch (err) {
    console.error('Failed to open file:', err)
  }
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

// macOS: files opened via Finder before app ready
app.on('open-file', (event, filePath) => {
  event.preventDefault()
  if (app.isReady() && mainWindow) {
    openFile(filePath)
  } else {
    pendingFilePath = filePath
  }
})

app.whenReady().then(() => {
  createWindow()
  registerIpcHandlers()
  buildMenu()

  // Linux / CLI: file path in argv
  const argPath = pendingFilePath ?? (process.argv.length > 1 ? process.argv[process.argv.length - 1] : null)
  if (argPath && argPath !== '.' && fs.existsSync(argPath)) {
    // Wait for renderer to be ready before sending
    mainWindow!.webContents.once('did-finish-load', () => {
      openFile(argPath)
    })
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
