"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  close: () => electron.ipcRenderer.send("close-window"),
  minimize: () => electron.ipcRenderer.send("minimize-window"),
  openHtmlFile: () => electron.ipcRenderer.invoke("open-html-file"),
  exportHtml: (html) => electron.ipcRenderer.invoke("export-html", html),
  saveTemplate: (html, name) => electron.ipcRenderer.invoke("save-template", html, name),
  listTemplates: () => electron.ipcRenderer.invoke("list-templates"),
  loadTemplate: (path) => electron.ipcRenderer.invoke("load-template", path)
});
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
