import {  useEffect, useState } from "react";
import './App.css';
import FileViewer from './FileViewer.js';
import Loading from './Loading';
function App() {
  
  const [loading,setLoading] = useState(createLoading());
  
  useEffect(() => {
      return () =>{
          
      }
  },[]);
  function createLoading(){
    return(<Loading unmountItself={unmountFileViewer}/>);
  }
  function unmountFileViewer(){
     setLoading(null);
  }
  
  return (
    <div  className="App">
     
      <header className="App-header">
        {loading}
        <FileViewer startLoad={() => {setLoading(createLoading())}}/>
      </header>
    </div>
  );
}

export default App;
