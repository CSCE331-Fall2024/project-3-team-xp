import { useEffect, useState } from 'react';
import video from '../assets/previewEdited.mp4'
import './MainPage.css'
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
    const [user, setUser] = useState(null);

    const un = useNavigate();
    const handleLogin = () => {
        un('/login');
    };

    const handleGuestLogin = () => {
        un('/kiosk');
    };

    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/user", { credentials: "include" })
            .then((response) => response.json())
            .then((data) => {
                if (!data.error) {
                    setUser(data);
                    console.log("setting user data")
                }
            })
            .catch((error) => console.error("Error fetching user data:", error));
    }, []);

    return (
        <div className='overflow-hidden'>
            <div className="absolute top-15 left-0 w-full h-full bg-black opacity-30 transition-opacity duration-10000"></div>
            <video src={video} autoPlay loop muted className="w-full object-cover overflow-y-hidden" />

            <div className="absolute top-15 left-0 w-full flex justify-center items-center min-h-screen">
                <div className="text-white text-center text-20xl max-w-lg -mt-[1600px]">
                    {user ? (
                        <h1 className="text-7xl font-bold text-red-200 mb-4 fade-in transition-opacity duration-1000">Welcome, {user.name}!</h1>
                    ) : (
                        <h1 className="text-7xl font-bold text-red-200 mb-4 fade-in transition-opacity duration-1000">Welcome!</h1>
                    )}
                    <p className="text-2xl text-red-400">We&apos;re glad to have you here.</p>
                </div>
            </div>

            <div className="flex justify-center items-center min-h-screen flex flex-col space-y-4 -mt-[600px]">
                <button onClick={handleLogin}
                    className="px-6 py-3 text-lg font-bold text-white bg-[#E53935] hover:bg-[#F55A4E] rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-125">
                    Login
                </button>
                <button onClick={handleGuestLogin}
                    className="px-6 py-3 text-lg font-bold text-gray-800 bg-red-300 hover:bg-red-200 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    Continue as Guest
                </button>
            </div>
        </div >
    );
};

export default MainPage;