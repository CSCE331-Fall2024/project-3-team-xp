import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Employees from './manager/employees';
import MenuItems from './manager/menuitems';
import CashierPanel from './cashier/CashierView';
import Navbar from './components/Navbar';
import Order from './kiosk/Order';
import Meals from './kiosk/Meals';
import Drinks from './kiosk/Drinks';
import Appetizers from './kiosk/Appetizers';
import Entrees from './kiosk/Entrees';
import Sides from './kiosk/Sides';
import ReportsView from './manager/ReportsView';
import MenuBoard from './menuBoard/menuBoard';
import { OrderProvider } from './lib/orderContext';
import MainPage from './components/MainPage';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { AuthProvider } from './lib/AuthContext';
import ProtectedRoute from './lib/ProtectedRoute';
import Ingredients from './manager/ingredients';
import Preferences from './kiosk/Preferences';
import TitleUpdater from './components/TitleUpdater';
import DarkModeToggle from './WICAG/darkMode';
import TextMagnifier from './WICAG/zoom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <OrderProvider>
        <BrowserRouter>
          <Navbar />
          <TitleUpdater />
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route
              path="/manager/employees"
              element={
                <ProtectedRoute allowedRoles={["Manager"]}>
                  <Employees />
                </ProtectedRoute>
              } />
            <Route
              path="/manager/menuitems" // New route for MenuItems
              element={
                <ProtectedRoute allowedRoles={["Manager"]}>
                  <MenuItems />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/reports"
              element={
                <ProtectedRoute allowedRoles={["Manager"]}>
                  <ReportsView />
                </ProtectedRoute>
              } />
            <Route
              path="/manager/ingredients"
              element={
                <ProtectedRoute allowedRoles={["Manager"]}>
                  <Ingredients />
                </ProtectedRoute>
              } />
            <Route
              path="/cashier"
              element={
                <ProtectedRoute allowedRoles={["Cashier", "Manager"]}>
                  <CashierPanel />
                </ProtectedRoute>
              } />
            <Route path="/kiosk" element={<Order />} />
            <Route path="/kiosk/Meals" element={<Meals />} />
            <Route path="/kiosk/Drinks" element={<Drinks />} />
            <Route path="/kiosk/Appetizers" element ={<Appetizers />} />
            <Route path="/kiosk/Entrees" element={<Entrees />} />
            <Route path="/kiosk/Sides" element={<Sides />} />
            <Route path="/kiosk/preferences" element={<Preferences />} />
            <Route path="/menu-board" element={<MenuBoard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </BrowserRouter>
      </OrderProvider>
    </AuthProvider>
    <DarkModeToggle />
    <TextMagnifier />
  </React.StrictMode>,
);
