import { ipcRenderer, contextBridge } from 'electron'


contextBridge.exposeInMainWorld('electron', {
  close: () => ipcRenderer.send('close-window'),
  minimize: () => ipcRenderer.send('minimize-window'),

  openHtmlFile: () => ipcRenderer.invoke('open-html-file'),
  exportHtml: (html : string) => ipcRenderer.invoke('export-html', html),

  saveTemplate: (html: string, name: string) => ipcRenderer.invoke('save-template', html, name),
  listTemplates: () => ipcRenderer.invoke('list-templates'),

  loadTemplate: (path) => ipcRenderer.invoke("load-template", path),

  exportPdf: (html: string) => ipcRenderer.invoke('export-pdf', html),

  getSavePath: (defaultName: string) => ipcRenderer.invoke('get-save-path', defaultName),
  saveBuffer: (filePath: string, buffer: Buffer) => ipcRenderer.invoke('save-buffer', filePath, buffer),
})

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})
