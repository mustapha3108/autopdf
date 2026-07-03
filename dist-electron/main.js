import { app, BrowserWindow, Menu, ipcMain, dialog } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
const userDataPath = app.getPath("userData");
const paths = {
  documents: path.join(userDataPath, "documents"),
  templates: path.join(userDataPath, "templates"),
  exports: path.join(userDataPath, "exports"),
  db: path.join(userDataPath, "app.db")
};
fs.mkdirSync(paths.documents, { recursive: true });
fs.mkdirSync(paths.templates, { recursive: true });
fs.mkdirSync(paths.exports, { recursive: true });
createRequire(import.meta.url);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    },
    frame: false,
    // removes title bar
    transparent: true,
    // transparent background
    resizable: true
  });
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  win.webContents.openDevTools({ mode: "detach" });
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  createWindow();
  Menu.setApplicationMenu(null);
  ipcMain.on("close-window", () => win?.close());
  ipcMain.on("minimize-window", () => win?.minimize());
  ipcMain.handle("open-html-file", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "HTML Files", extensions: ["html", "htm"] }]
    });
    if (result.canceled) return null;
    return fs.readFileSync(result.filePaths[0], "utf-8");
  });
  ipcMain.handle("export-html", async (_event, html) => {
    const result = await dialog.showSaveDialog({
      filters: [{ name: "HTML File", extensions: ["html"] }],
      defaultPath: "document.html"
    });
    if (result.canceled || !result.filePath) return;
    fs.writeFileSync(result.filePath, html, "utf-8");
  });
  ipcMain.handle("save-template", async (_event, html, name) => {
    const filePath = path.join(paths.templates, `${name}.html`);
    fs.writeFileSync(filePath, html, "utf-8");
    return filePath;
  });
  ipcMain.handle("list-templates", async () => {
    return fs.readdirSync(paths.templates).filter((f) => f.endsWith(".html")).map((f) => ({
      name: f.replace(".html", ""),
      path: path.join(paths.templates, f)
    }));
  });
  ipcMain.handle("load-template", async (_event, filePath) => {
    return fs.readFileSync(filePath, "utf-8");
  });
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
