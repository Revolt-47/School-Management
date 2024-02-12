import logo from './logo.svg';
import './App.css';
import PaymentForm from '../../payment/src/PaymentScreens/InititalPayment';
import SuccessScreen from '../../payment/src/PaymentScreens/ConfirmationScreen';
import { Route, Routes, Navigate } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <div className="App">
     <Router>
        <Routes>
           <Route path="/:schoolId" element={<PaymentForm />}  />
          <Route path="verify/:schoolId" element={<SuccessScreen />}  /> 
        </Routes>
      </Router>
    </div>
  );
}

export default App;
