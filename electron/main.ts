import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import mammoth from 'mammoth'

// setup user data paths
const userDataPath = app.getPath('userData')

const paths = {
  documents: path.join(userDataPath, 'documents'),
  templates: path.join(userDataPath, 'templates'),
  exports:   path.join(userDataPath, 'exports'),
  db:        path.join(userDataPath, 'app.db'),
}

// create folders on first run if they don't exist
fs.mkdirSync(paths.documents, { recursive: true })
fs.mkdirSync(paths.templates, { recursive: true })
fs.mkdirSync(paths.exports,   { recursive: true })


const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    frame: false,          // removes title bar
    transparent: true,     // transparent background
    resizable: true,
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  win.webContents.openDevTools({ mode: 'detach' })

}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

//app.whenReady().then(createWindow)
app.whenReady().then(() => {
  createWindow()
  Menu.setApplicationMenu(null)
  ipcMain.on('close-window', () => win?.close())
  ipcMain.on('minimize-window', () => win?.minimize())

  ipcMain.handle('open-html-file', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'HTML Files', extensions: ['html', 'htm'] }]
    })
    if (result.canceled) return null
    return fs.readFileSync(result.filePaths[0], 'utf-8')
  })

  ipcMain.handle('export-html', async (_event, html: string) => {
    const result = await dialog.showSaveDialog({
      filters: [{ name: 'HTML File', extensions: ['html'] }],
      defaultPath: 'document.html'
    })
    if (result.canceled || !result.filePath) return
    fs.writeFileSync(result.filePath, html, 'utf-8')
  })

  ipcMain.handle('save-template', async (_event, html: string, name: string) => {
    const filePath = path.join(paths.templates, `${name}.html`)
    fs.writeFileSync(filePath, html, 'utf-8')
    return filePath
  })

  ipcMain.handle('list-templates', async () => {
    return fs.readdirSync(paths.templates)
      .filter(f => f.endsWith('.html'))
      .map(f => ({
        name: f.replace('.html', ''),
        path: path.join(paths.templates, f)
      }))
  })

  ipcMain.handle('load-template', async (_event, filePath: string) => {
    return fs.readFileSync(filePath, 'utf-8')
  })

})