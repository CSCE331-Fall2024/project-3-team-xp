import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Employees from './manager/employees';
import CashierPanel from './cashier/CashierView';
import Navbar from './components/Navbar';
import Order from './kiosk/Order';
import Meals from './kiosk/Meals'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/manager" element={<Employees />} />
        <Route path="/cashier" element={<CashierPanel />} />
        <Route path="/kiosk" element={<Order />} />
        <Route path="/kiosk/Meals" element={<Meals />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
