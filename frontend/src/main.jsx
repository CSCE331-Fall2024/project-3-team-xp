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
import { OrderProvider } from './lib/orderContext';
import MainPage from './components/MainPage';
import Login from './components/Login';
import SignUp from './components/SignUp';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OrderProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="" element={<MainPage />} />
        <Route path="/manager" element={<Employees />} />
          <Route path="/cashier" element={<CashierPanel />} />
          <Route path="/kiosk" element={<Order />} />
          <Route path="/kiosk/Meals" element={<Meals />} />
          <Route path="/manager/reports" element={<ReportsView />} />
          <Route path="/menu-board" element={<MenuBoard />} />
          <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
      </BrowserRouter>
    </OrderProvider>
  </React.StrictMode>,
);
