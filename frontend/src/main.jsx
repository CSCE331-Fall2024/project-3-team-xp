import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Employees from './manager/employees';
import CashierPanel from './cashier/CashierView';
import Navbar from './components/Navbar';
import Order from './kiosk/Order';
import Meals from './kiosk/Meals'
import ReportsView from './manager/ReportsView';
import MenuBoard from './menuBoard/menuBoard';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/manager" element={<Employees />} />
        <Route path="/cashier" element={<CashierPanel />} />
        <Route path="/kiosk" element={<Order />} />
        <Route path="/kiosk/Meals" element={<Meals />} />
        <Route path="/manager/reports" element={<ReportsView />} />
        <Route path="/menu-board" element={<MenuBoard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
