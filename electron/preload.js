const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  getDisks: (callback) => ipcRenderer.on('getDisks', (_event,disks) => callback(disks)),
  wantDisks: () => ipcRenderer.send("wantDisks"),
  getPlatform: () => ipcRenderer.send("getPlatform",platform),
  startScanning: (path) => ipcRenderer.send('startScanning',path),
  openFolder: (path) => ipcRenderer.send('openFolder',path),
  onFileUpdate: (callback) => ipcRenderer.on('fileUpdate', (_event, value) => callback(value)),
  onFileEnd: (callback) => ipcRenderer.on('fileEnd', (_event) => callback()),
  onOSget: (callback) => ipcRenderer.on('getOs', (_event,os) => callback(os)),
  wantOS: () => ipcRenderer.send("wantOs"),
  getFileList: (callback) => ipcRenderer.on('getFileList',(_event,path,data,isLast) => callback(path,data,isLast)),
  removeThisListener: (str,func) => ipcRenderer.removeAllListeners(str)
})
