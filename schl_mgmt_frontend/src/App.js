import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/NavigationBar';
import './App.css';

function App() {
  return (
    <BrowserRouter>
    <div className="App" style={{backgroundColor:"#d3d3d3",  marginTop:"-5px"}}>
      <nav>
        <Navbar />
      </nav>
    </div>
    </BrowserRouter>
  );
}

export default App;
