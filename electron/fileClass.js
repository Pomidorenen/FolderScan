const AbstractClass = require("./abstractClass");
const fs = require('fs');
module.exports = class FileClass extends AbstractClass{
    constructor(parent,path){
        super(parent,path,"file");
        if(this.canRead){
            try {
                this._size += fs.statSync(path).size;
                parent._size += this._size;
            } catch (error) {
                console.log("Can't read " + path);
            }
        }
    }
}