import { app, BrowserWindow, nativeTheme } from 'electron'
import { join } from 'path'
import fs from 'fs'
import { registerIpcHandlers } from './ipc'
import { buildMenu } from './menu'

let mainWindow: BrowserWindow | null = null
let pendingFilePath: string | null = null

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
