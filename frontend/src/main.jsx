import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import ReportsView from './manager/ReportsView';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/manager/ReportsView" element={<ReportsView />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
