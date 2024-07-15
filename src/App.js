import { useState } from "react";
import './App.css';
import FileViewer from './FileViewer.js';
import Loading from './Loading';
function App() {
    const [loading,setLoading] = useState(true);
  return (
    <div  className="App">
      <header className="App-header">
        {(loading)&&<Loading unmountItself={()=>setLoading(false)}/>}
        <FileViewer startLoad={() => {setLoading(true)}}/>
      </header>
    </div>
  );
}

export default App;
