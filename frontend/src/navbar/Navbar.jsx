import React from 'react'
import './Navbar.css'
import PandaLogo from '../assets/PandaLogo.png'
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <div className = 'navbar'>
            <img src={PandaLogo} alt="" className='logo'/>
            <buttons>
                <items>Manager</items>
                <items>Cashier</items>
                <items>Customer</items>
                <items>Display</items>
                <right><items>Log in</items></right>
             </buttons>
        </div>
    )
}

export default Navbar


/**
import React from 'react';
import PandaLogo from '../assets/PandaLogo.png';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <div className="navbar fixed top-0 left-0 w-full flex items-center bg-pink-200 p-2 z-50">
            <img src={PandaLogo} alt="Logo" className="h-12 w-auto" />
            <div className="flex flex-1 justify-center space-x-4">
                <Link to="/manager" className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-500 transform hover:scale-105">
                    Manager
                </Link>
                <Link to="/cashier" className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-500 transform hover:scale-105">
                    Cashier
                </Link>
                <Link to="/customer" className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-500 transform hover:scale-105">
                    Customer
                </Link>
                <Link to="/display" className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-500 transform hover:scale-105">
                    Display
                </Link>
            </div>
            <div className="ml-auto">
                <Link to="/login" className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-500 transform hover:scale-105">
                    Log in
                </Link>
            </div>
        </div>
    );
};

export default Navbar;
*/