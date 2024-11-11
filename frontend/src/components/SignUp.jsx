import React, { useState } from 'react';
import logo from '../assets/logo_panda.png';
import background from '../assets/signupBG.jpg';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConf, setPasswordConf] = useState('');
    const [username, setUsername] = useState('');
    const un = useNavigate();

    const createAccount = () => {
        // do stuff idk
        un('/login');
    };

    return (
        <div className="relative min-h-screen">
            <img src={background} alt="nice food image" className="absolute top-[10px] left-0"/>
            <div className="relative z-10 text-white">
                <div className="flex justify-center items-center my-[-10px]">
                    <img src={logo} alt="panda logo" className="w-[70px] h-auto -mt-[-25px]"/>
                </div>  
                <div className="bg-[#ffd5d5] p-4 rounded-lg shadow-lg max-w-md w-full -ml-[-420px]">              
                    <form onSubmit={createAccount}>
                        <div className="mb-3">
                            <label htmlFor="username" className="block text-red-800 text-sm font-medium mb-1">Username</label>
                            <input
                                type="username"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full px-3 py-2 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="Create a username"/>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="block text-red-800 text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="Enter your email"/>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="block text-red-800 text-sm font-medium mb-1">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="Create your password"/>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="passwordConf" className="block text-red-800 text-sm font-medium mb-1">Password Confirmation</label>
                            <input
                                type="password"
                                id="passwordConf"
                                value={passwordConf}
                                onChange={(e) => setPasswordConf(e.target.value)}
                                required
                                className="w-full px-3 py-2 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="Password Confirmation"/>
                        </div>
                        <div className="flex items-center justify-center">
                            <button
                                type="submit"
                                className="py-2 px-4 bg-[#E53935] hover:bg-[#F55A4E] hover:scale-110 text-white font-bold rounded-md transition duration-200">
                                Join Panda
                            </button>
                        </div>
                   </form>
                </div>
            </div>
        </div>
    );
  };
  
export default SignUp;