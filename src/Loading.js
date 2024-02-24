import { useEffect, useState } from "react";
import './Loading.css';

function Loading({unmountItself}) {
    const [currentFile, setCurrenFile] = useState('');
    const [clicked,setClicked] = useState(false)
    const [selectorItems,setSelectorItems] = useState([]);
    const [mountpoints,setMountpoints] = useState([]);
    const [rawDisks,setRawDisks] = useState([]);
    const [path,setPath] = useState("");
    useEffect(() => {
        window.electronAPI.onFileEnd(scanEnd);
        window.electronAPI.onFileUpdate(setCurrenFile);
        window.electronAPI.getDisks(getDisks);
        window.electronAPI.wantDisks();
        
        return () =>{
            window.electronAPI.removeThisListener("fileUpdate");
            window.electronAPI.removeThisListener("fileEnd");
            window.electronAPI.removeThisListener("getDisks");
        }
    },[]);
    function startScaning(){
        if(clicked){
            return;
        }
        setClicked(true);
        window.electronAPI.startScanning(path);
    }
    function scanEnd(){
        setCurrenFile("files ends");
        unmountItself();
    }
    function getDisks(disks){
        setRawDisks(disks);
        let out = [];
        disks.forEach(element => {
            let str = "";
            if(element.name == null || element.name == ""){
                str = element.spareName;
            }
            else{
                str = element.name;
            }
            out.push(<option key={element.mountpoints} value={element.mountpoints}>{str}</option>)
        });
        setSelectorItems(out);
        forceDisk(disks[0].mountpoints[0]);
        setPath(disks[0].mountpoints[0]);
    }
    function forceDisk(path){
        setMountpoints(<option key={path}>{path}</option>);
    }
    function selectedDiskChanged(e){
        let out = [];
        rawDisks[e.target.selectedIndex].mountpoints.forEach(element =>{
            out.push(<option key={element}>{element}</option>);
        });
        setMountpoints(out);
        setPath(rawDisks[e.target.selectedIndex].mountpoints[0]);
    }
    function selectPartChanged(e){
        setPath(e.target.value);
    }
    
    
    return (
        <div className='background-loading'>
            <div className="Loading-screen">
                {clicked&&<span className="loader"></span>}
                {!clicked && <text onClick={startScaning} className="loadingButton">[Start scan] {path}</text>}
                {clicked&&<text> Please wait</text>}
                <text className="CurrentFile">{currentFile}</text>
                {!clicked&&<div>
                    <select  onChange={selectedDiskChanged} className="selector">
                      {selectorItems}
                    </select>
                    <select onChange={selectPartChanged} className="selector">
                      {mountpoints};
                    </select>
                </div>}
                
            </div>
        </div>
    );
  }
export default Loading;