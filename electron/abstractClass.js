const fs = require('fs');
const nodePath = require('path');
module.exports = class AbstractFile{
    _size = 0;
    #parent = null;
    #path = "";
    #type = "";
    #readable = false;
    #isReadable(){
        let out = false; 
        try{
            fs.accessSync(this.#path, fs.constants.R_OK);
            out = true;
        }catch (err){
            out = false;
            console.log("Can't read " + this.#path);
        }
        this.#readable = out;
    }
    
    constructor(parent,path,type){
        this.#type = type;
        this.#parent = parent;
        this.#path = path;
        this.#isReadable();
    }
    _setParent(parent){
        this.#parent = parent;
    }
    get parent(){
        return this.#parent;
    }
    get type(){
        return this.#type;
    }
    get currentSize(){
        return this._size;
    };
    get currentName(){
        return  nodePath.basename(this.#path);
    }
    get canRead(){
        return this.#readable;
    }
    get currentPath(){
        return this.#path;
    };
}