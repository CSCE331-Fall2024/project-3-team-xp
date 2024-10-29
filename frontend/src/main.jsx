import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import ReportsView from './manager/ReportsView';
import MenuBoard from './menuBoard/menuBoard';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/manager/ReportsView" element={<ReportsView />} />
        <Route path="/menuBoard/MenuBoard" element={<MenuBoard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
