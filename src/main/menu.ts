import { Menu, shell, ipcMain } from 'electron'
import { getMainWindow } from './index'

export function buildMenu(): void {
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? [{
          label: 'md-edit',
          submenu: [
            { role: 'about' as const },
            { type: 'separator' as const },
            { role: 'services' as const },
            { type: 'separator' as const },
            { role: 'hide' as const },
            { role: 'hideOthers' as const },
            { role: 'unhide' as const },
            { type: 'separator' as const },
            { role: 'quit' as const }
          ]
        }]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            ipcMain.emit('menu:openFile')
            const win = getMainWindow()
            win?.webContents.send('menu:action', 'openFile')
          }
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            const win = getMainWindow()
            win?.webContents.send('menu:action', 'save')
          }
        },
        { type: 'separator' },
        {
          label: 'Export as HTML...',
          accelerator: 'CmdOrCtrl+Shift+H',
          click: () => {
            const win = getMainWindow()
            win?.webContents.send('menu:action', 'exportHTML')
          }
        },
        {
          label: 'Export as PDF...',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => {
            const win = getMainWindow()
            win?.webContents.send('menu:action', 'exportPDF')
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' as const } : { role: 'quit' as const }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        { role: 'selectAll' as const }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Theme',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => {
            const win = getMainWindow()
            win?.webContents.send('menu:action', 'toggleTheme')
          }
        },
        { type: 'separator' },
        { role: 'resetZoom' as const },
        { role: 'zoomIn' as const },
        { role: 'zoomOut' as const },
        { type: 'separator' },
        { role: 'togglefullscreen' as const },
        ...(process.env.NODE_ENV === 'development'
          ? [{ type: 'separator' as const }, { role: 'toggleDevTools' as const }]
          : [])
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click: () => shell.openExternal('https://github.com')
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
