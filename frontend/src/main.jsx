import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Employees from './manager/employees';
import CashierPanel from './cashier/CashierView';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/manager/employees" element={<Employees />}/>
        <Route path="/cashier" element={<CashierPanel />}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
