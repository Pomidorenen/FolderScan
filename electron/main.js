const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const os = require('os');
const serve = require('electron-serve');
const loadURL = serve({ directory: 'build' });
const FolderClass = require('./folderClass.js');
const globalVariables = require('./globalVar');
const DiskLists = require("./DiskLists.js")
var win;

function isDev() {
  return !app.isPackaged;
}
const createWindow = () => {
    win = new BrowserWindow({
      width: 800,
      height: 600,
      title:"Folder Scan",
      webPreferences: {
        preload: path.join(__dirname, './preload.js'),
        devTools: false
      }
    });

    if (isDev()) {
      win.loadURL('http://localhost:3000/');
  } else {
      loadURL(win);
  }
  globalVariables.window = win;
  win.setMenu(null);
  switch(os.platform()){
    case "linux":
        globalVariables.separator = "/";
        break;
    case "win32":
        globalVariables.separator = "\\";
        break;
    }
    globalVariables.os = os.platform();
}
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

ipcMain.on("wantDisks",(event)=>{
    globalVariables.window.webContents.send('getDisks',DiskLists.getDisks());
})
ipcMain.on("wantOs",(event)=>{
    globalVariables.window.webContents.send('getOs',globalVariables.os);
});
ipcMain.on("startScanning",(event,data)=>{
  let finded = false;
  if(globalVariables.alreadyOpened.length!=0){
    for(let i = 0; i<globalVariables.alreadyOpened.length;i++){
      if(globalVariables.alreadyOpened[i].currentPath==data){
          globalVariables.alreadyOpened[i].openFolder(data);
          finded = true;
          globalVariables.window.webContents.send('fileEnd');
          break;
      }
      if(globalVariables.alreadyOpened[i].findChild(data)!=undefined){
        globalVariables.alreadyOpened[i].openFolder(data);
        finded = true;
        globalVariables.window.webContents.send('fileEnd');
        break;
      }
    }
  }
  if(!finded){
    let mainDisk = new FolderClass(null,data);
    globalVariables.alreadyOpened.push(mainDisk);
  }
  
})
ipcMain.on("openFolder",(event,path)=>{
  for(let i = 0; i<globalVariables.alreadyOpened.length;i++){
    if(path.includes(globalVariables.alreadyOpened[i].currentPath)){
        globalVariables.alreadyOpened[i].openFolder(path);
        return;
    }
  }
})