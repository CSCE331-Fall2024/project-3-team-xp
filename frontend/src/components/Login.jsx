import { useState } from 'react';
import logo from '../assets/logo_panda.png';
import background from '../assets/niceFood.jpg';
import { Link, useNavigate } from 'react-router-dom';


const Login = () => {
    const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const un = useNavigate();

    const handleLogin = () => {
        // do stuff idk
        un('/kiosk');
    };

    const handleSignupRedirect = () => {
        un('/signup');
    };

    const handleGoogleLogin = () => {
        window.location.href = `http://${VITE_SERVER_URL}/login`;
    }

    return (
        <div className="relative min-h-screen">
            <img src={background} alt="nice food image" className="absolute top-[10px] left-0 w-full h-auto" />
            <div className="relative z-10 text-white">
                <div className="flex justify-center items-center my-[-10px]">
                    <img src={logo} alt="panda logo" className="w-[70px] h-auto -mt-[-60px]" />
                </div>
                <div className="bg-[#ffd5d5] p-4 rounded-lg shadow-lg max-w-md w-full -ml-[-420px]">
                    <div className="flex w-full items-center justify-center">
                        <Link onClick={handleGoogleLogin} to="/login" type="google login" className='mt-3 py-2 px-20 bg-[#ffd5d5] hover:bg-[#ffdfdf] text-blue-800 border-2 font-bold border-blue-500 m-1'> Continue with Google </Link>
                    </div>
                    <form onSubmit={handleLogin}>
                        <div className="pt-2 flex items-center justify-center">
                            <div className="border-t border-red-700 w-1/3"></div>
                            <span className="mx-1 text-red-500">OR</span>
                            <div className="border-t border-red-700 w-1/3"></div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-red-800 text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="Enter your email" />
                        </div>

                        <div className="mb-6 pb-0">
                            <label htmlFor="password" className="block text-red-800 text-sm font-medium mb-1">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="Enter your password" />
                        </div>
                        <div className='text-sm flex justify-end -mt-6 p-1'><p className='hover:text-red-600'>Forgot password? ggs</p></div>
                        <div className="flex items-center justify-center">
                            <button
                                type="submit"
                                className="py-2 px-4 bg-[#E53935] hover:bg-[#F55A4E] hover:scale-110 text-white font-bold rounded-md transition duration-200">
                                Sign In
                            </button>
                        </div>
                        <div className="text-sm text-center pt-3">
                            <p>
                                <button onClick={handleSignupRedirect} className="underline hover:text-red-600">
                                    Sign up
                                </button>{' '}
                                if you don&apos;t have an account yet!</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
};

export default Login;