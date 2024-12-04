/**
 * MainPage Component
 *
 * This component represents the main landing page of the application. 
 * It provides functionality for user interaction such as logging in, continuing as a guest, or logging out. 
 * A video background and a welcoming message are displayed.
 */
import video from '../assets/previewEdited.mp4';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const MainPage = () => {
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    /**
     * The authenticated user object obtained from the AuthContext.
     */
    const { user } = useAuth();  

    /**
     * Navigation instance from React Router for page transitions.
     */
    const navigate = useNavigate();

    /**
     * Redirects the user to the login page.
     */
    const handleLogin = () => {
        navigate('/login');
    };

    /**
     * Redirects the user to the guest kiosk page.
     */
    const handleGuestLogin = () => {
        navigate('/kiosk');
    };

    /**
     * Redirects the user to the backend logout endpoint.
     */
    const handleLogout = () => {
        window.location.href = `${VITE_BACKEND_URL}/logout`;
    };

    return (
        <div className='overflow-hidden'>
            <div className="absolute top-15 left-0 w-full h-full bg-black opacity-30 transition-opacity duration-10000"></div>
            <video src={video} autoPlay loop muted className="w-full overflow-y-hidden" />
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

            <div className="flex justify-center items-center min-h-screen flex-col space-y-4 -mt-[600px]">
                {!user ? (
                    <>
                        <button onClick={handleLogin}
                            className="px-6 py-3 text-lg font-bold text-white bg-[#E53935] hover:bg-[#F55A4E] rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-125">
                            Login
                        </button>
                        <button onClick={handleGuestLogin}
                            className="px-6 py-3 text-lg font-bold text-gray-800 bg-red-300 hover:bg-red-200 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                            Continue as Guest
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 text-lg font-bold text-white bg-[#E53935] hover:bg-[#F55A4E] rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-125">
                        Logout
                    </button>
                )}
            </div>
        </div>
    );
};

export default MainPage;
