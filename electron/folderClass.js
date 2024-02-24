const AbstractFile = require("./abstractClass");
const FileClass = require("./fileClass");
const nodePath = require('path');
const globalVariables = require('./globalVar');
const path = require('path');
const fs = require('fs');
const os = require('os');
module.exports =  class FolderClass extends AbstractFile{
    #childrens = [];
    #setChildrens(){
        globalVariables.window.webContents.send('fileUpdate', this.currentPath);
        let openedDir = [];
        try{
            openedDir = fs.readdirSync(this.currentPath,{withFileTypes: true});
        }
        catch(err){
            console.log("Can't open directory " + this.currentPath);
        }
        if(openedDir.length!=0){
            for(let i = 0;i<openedDir.length;i++){
                let path = nodePath.join(openedDir[i].path,openedDir[i].name);
                if(openedDir[i].isDirectory()){
                    this.#childrens.push(new FolderClass(this,path));
                }
                if(openedDir[i].isFile()){
                    this.#childrens.push(new FileClass(this,path));
                }
            }
        }
    }
    findChild(path){
        if(path === this.currentPath){
            return this.#childrens;
        }
        let cuttedPath;
        if(this.currentPath == "/"){
            cuttedPath = path.replace(this.currentPath,"");
        }
        else{
                if(this.currentPath[this.currentPath.length-1] != globalVariables.separator){
                    cuttedPath = path.replace(this.currentPath + globalVariables.separator,"");
                }
                else{
                    cuttedPath = path.replace(this.currentPath,"");
                }
        }
        let arrFolders = cuttedPath.split(globalVariables.separator);
        for(let i = 0;i<this.#childrens.length;i++){
            if(this.#childrens[i].currentName === (arrFolders[0])){
                return this.#childrens[i].findChild(path);
            }
        }
    }
    openFolder(path) {
        let openedChildrens = this.findChild(path);
        let arr = [];
            for(let i = 0;i<openedChildrens.length;i++){
                arr.push({
                    name:openedChildrens[i].currentName,
                    path:openedChildrens[i].currentPath,
                    size:openedChildrens[i]._size,
                    type:openedChildrens[i].type,

                });
            }
        let isLast = false;
        if(path==this.currentPath && this.parent==null){
            isLast = true;
        }
        globalVariables.window.webContents.send('getFileList',path,arr,isLast);
    }
    get getChildrens(){
        return this.#childrens;
    }
    constructor(parent,path){
        super(parent,path,"folder");
        if(os.platform=="linux"){
            //Linux mount system can let you mount one drive in another
            //For example /media/PATH are mounted inside system partition(/)
            //So why do we need to rescan already scanned folders?
            if(globalVariables.alreadyOpened.length!=0 && parent!=null){
                for(let i = 0; i<globalVariables.alreadyOpened.length;i++){
                  if(globalVariables.alreadyOpened[i].currentPath==path){
                      globalVariables.alreadyOpened[i]._setParent(parent);
                      this._size = globalVariables.alreadyOpened[i]._size;
                      parent._size += this._size;
                      this.#childrens = globalVariables.alreadyOpened[i].getChildrens;
                      return;
                  }
                }
              }
        }
        if(this.canRead){
            this.#setChildrens();
        }
        if(parent!=null){
            parent._size += this._size;
        }
        else{
            globalVariables.window.webContents.send('fileEnd');
            this.openFolder(this.currentPath);
        }
    }
    

}