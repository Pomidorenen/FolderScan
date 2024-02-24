const os = require('os');
const { execSync } = require('node:child_process');
class DiskLists{
    // name spareName mountpoints[]
    static getDisks(){
        switch(os.platform()){
            case "linux":
                return this.#getDisksLinux();
            case "win32":
                return this.#getDisksWindows();
            default:
                console.log("currently unsupported");
        }
    }
    static #getDisksLinux(){
        let returnVal = [];
        const command = "lsblk -I 8 --json -o NAME,LABEL,MOUNTPOINTS";
        let output = execSync(command).toString();
        output = JSON.parse(output);
        output['blockdevices'].forEach(disk => {
            disk['children'].forEach(partition => {
                if(partition["mountpoints"][0]!=null && partition["mountpoints"][0]!="[SWAP]"){
                    returnVal.push({name:partition["label"],spareName:partition["name"],mountpoints:partition["mountpoints"]});
                }
            });
        });
        return returnVal;
    }
    static #getDisksWindows(){
        let returnVal = [];
        const command = "Get-WmiObject Win32_LogicalDisk |select Name,VolumeName |ConvertTo-JSON";
        let output = execSync(command,{'shell':'powershell.exe'}).toString();
        output = JSON.parse(output);
        output.forEach(disk => {
            returnVal.push({name:disk["VolumeName"],spareName:disk["Name"],mountpoints:[disk["Name"]+"\\"]});
        });
        return returnVal;
    }
};
module.exports = DiskLists;