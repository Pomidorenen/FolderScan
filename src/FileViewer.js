import {  useEffect, useState, useRef } from "react";
import "./FileViewer.css"

function FileViewer(props){
    const [nameAscending,setNameAscending] = useState(true);
    const [sizeAscending,setSizeAscending] = useState(true);
    const [typeAscending,setTypeAscending] = useState(true);
    const [currentColumn,setCurrentColumn] = useState(1);
    const [currentPath,setCurrentPath] = useState("Path currently empty");
    const [items,setItems] = useState([]);
    const [onTop,setOnTop] = useState(true);
    const [osType,setOS] = useState("");
    const [previousItems,setPreviousItems] = useState([]);
    const [endIndex,setEndIndex] = useState(100);
    const [startIndex,setStartIndex] = useState(0);
    const [filesRaw,setFilesRaw] = useState([]);
    const [scrollUp,setScrollUp] = useState(0);
    const tableRef = useRef(null);
    
    useEffect(() => {
        window.electronAPI.getFileList(setFileList);
        window.electronAPI.onOSget(setOS);
        window.electronAPI.wantOS();
        return () =>{
            window.electronAPI.removeThisListener("getFileList");
            window.electronAPI.removeThisListener("getOs");
        }
    },[]);
    useEffect(() => {
        setStartIndex(0);
        setEndIndex(100);
        setScrollUp(1);
    },[filesRaw,currentColumn,nameAscending,sizeAscending,typeAscending,nameAscending,currentPath]);
    useEffect(() => {
        if(scrollUp == 1){
            tableRef.current.scrollTo(0,0);
        }
        setScrollUp(0);
    },[scrollUp]);
    useEffect(() =>{
        fileList(filesRaw);
    },[startIndex,endIndex])
    function setFileList(path,arr,isLast){
        arr.sort((a,b)=>a.size-b.size);
        setFilesRaw(arr);
        setCurrentPath(path);
        fileList(arr);
        setOnTop(isLast);
    }
    function goUp(){
        let newPath = "";
        switch(osType){
            case "linux":
                newPath = currentPath.substring(0,currentPath.lastIndexOf("/"));
                if(newPath === ""){
                    newPath = "/";
                }
                break;
            case "win32":
                newPath = currentPath.substring(0,currentPath.lastIndexOf("\\"));
                if(!newPath.includes("\\")){
                    newPath+="\\";
                }
                break;
        }
        console.log(currentPath);
        console.log(newPath);
        setPreviousItems([currentPath,...previousItems,]);
        window.electronAPI.openFolder(newPath);
    }
    function goBack(){
        window.electronAPI.openFolder(previousItems[0]);
        setPreviousItems([...previousItems.slice(1)]);
    }
    function sortBy(select,parametrs,column){
        if(select){
            filesRaw.sort((a,b)=>b[paramets]-a[paramets]);
        }
        else{
            filesRaw.sort((a,b)=>a[paramets]-b[paramets]);
        }
        fileList(filesRaw);
        setNameAscending(!select);
        setCurrentColumn(column);
    }

    function clickedItem(path,type){
        setPreviousItems([]);
        if(type == "folder"){
            window.electronAPI.openFolder(path);
        }
    }
    function scroller(e){
        if(tableRef.current.scrollHeight - tableRef.current.scrollTop < tableRef.current.clientHeight*1.3 && filesRaw.length>endIndex+100){
            tableRef.current.scrollTo(0,(tableRef.current.scrollHeight - tableRef.current.clientHeight) / 2);
            setEndIndex(endIndex+100);
            setStartIndex(startIndex+100);
        }
        else if(tableRef.current.scrollTop*0.7 < tableRef.current.clientHeight && endIndex>100 ){
            tableRef.current.scrollTo(0,(tableRef.current.scrollHeight - tableRef.current.clientHeight) / 2);
            setStartIndex(startIndex-100);//this
            setEndIndex(endIndex-100);
        }
    }
    function fileList(arr){
        var BreakException = {};
        var result = [];
        arr = arr.slice(startIndex);
        try{
            arr.forEach((element,i) =>{
                if(i>=endIndex-startIndex){
                    throw BreakException;
                }
                result.push(
                    <tr style={{cursor:element.type == "folder"?"pointer":"default"}} key={element.name} onClick={() => {clickedItem(element.path,element.type)}} className="rowItem" >
                    <td className="elementType"> {element.type == "folder"?"🗀":"🗏"}</td>
                    <td className="elementText">{element.name}</td>
                    <td className="elementSize">{getReadableFileSizeString(element.size)}</td>
                </tr>
                );
            })
        }
        catch(e){

        }
        setItems(result);
    }
    return (
    <div className="FileViewer">
        <div className="ButtonRow">
            <button onClick={goUp} disabled={onTop} className="navButtons">◁</button>
            <button onClick={goBack} disabled={previousItems.length==0} className="navButtons">▷</button>
            <button onClick={props.startLoad} className="navButtons">⌕</button>
            <text className="currentPath">{currentPath}</text>
        </div>
        <div className="Table" ref={tableRef}  onScroll={scroller} >
        <table>
            <thead>
                <th onClick={()=>sortBy(typeAscending,"type",2)}>Type{currentColumn===2?(typeAscending?"▽":"△"):""}</th>
                <th onClick={()=>sortBy(nameAscending,"name",0)} className="elementText">Name{currentColumn===0?(nameAscending?"▽":"△"):""}</th>
                <th onClick={()=>sortBy(nameAscending,"size",1)}>Size{currentColumn===1?(sizeAscending?"▽":"△"):""}</th>
            </thead>
            <tbody >
                {items}
            </tbody>
        </table>
        </div>
    </div>
    );
}

export default FileViewer;

function getReadableFileSizeString(fileSizeInBytes) {
    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
      fileSizeInBytes /= 1024;
      i++;
    } while (fileSizeInBytes > 1024);
    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
  }