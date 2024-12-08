import PandaLogo from '../assets/PandaLogo.png'
import { Link } from 'react-router-dom';
import SelectLang from '../translation/translationWidget'
import { useAuth } from '../lib/AuthContext';
import './Navbar.css';
const Navbar = () => {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const { user } = useAuth();
  const handleLogout = () => {
    window.location.href = `${VITE_BACKEND_URL}/logout`;
  }

  return (
    <nav className="top-0 left-0 w-full flex items-center justify-between bg-[#ffd5d5] px-[10px] py-[3px] z-[100]">
      <div>
        <Link to="">
          <img src={PandaLogo} alt="Logo" className="h-[50px] w-auto p-0" />
        </Link>
      </div>

      <div className="flex-1 flex justify-center items-center space-x-[20px] ml-64">
      {/*
      <div className="z-[100] relative flex items-center space-x-2">
        <div className="z-[100] dropdown relative px-3 py-1 text-sm bg-[#E53935] text-white rounded-[20px_1%] transition-all duration-300 hover:bg-[#F55A4E] hover:scale-110 hover:pb-5">
          Manager
          <div className="dropdown-menu absolute hidden flex-col bg-[#E53935] text-white rounded-[20px_1%] scale-[0.8]">
            <Link to="/manager/employees" className="px-4 py-2 hover:bg-[#F55A4E] hover:rounded-[20px_1%]">
              Employees
            </Link>
            <Link to="/manager/reports" className="px-4 py-2 hover:bg-[#F55A4E] hover:rounded-[20px_1%]">
              Reports
            </Link>
            <Link to="/manager/menuitems" className="px-4 py-2 hover:bg-[#F55A4E] hover:rounded-[20px_1%]">
              Menu Items
            </Link>
            <Link to="/manager/ingredients" className="px-4 py-2 hover:bg-[#F55A4E] hover:rounded-[20px_1%]">
              Ingredients
            </Link>
          </div>
        </div>
      </div>
      */}
      <Link
          to="/manager/actions"
          className="inline-block px-[15px] py-[3px] text-base cursor-pointer bg-[#E53935] text-white rounded-[20px_1%] transition-all duration-300 hover:bg-[#F55A4E] hover:scale-110"
        >
          Manager
        </Link>
        <Link
          to="/cashier"
          className="inline-block px-[15px] py-[3px] text-base cursor-pointer bg-[#E53935] text-white rounded-[20px_1%] transition-all duration-300 hover:bg-[#F55A4E] hover:scale-110"
        >
          Cashier
        </Link>
        <Link
          to="/kiosk"
          className="inline-block px-[15px] py-[3px] text-base cursor-pointer bg-[#E53935] text-white rounded-[20px_1%] transition-all duration-300 hover:bg-[#F55A4E] hover:scale-110"
        >
          Kiosk
        </Link>
        <Link
          to="/menu-board"
          className="inline-block px-[15px] py-[3px] text-base cursor-pointer bg-[#E53935] text-white rounded-[20px_1%] transition-all duration-300 hover:bg-[#F55A4E] hover:scale-110"
        >
          Menu Board
        </Link>
      </div>

      <div className="flex items-center mr-24">
        <SelectLang />
      </div>

      <div className="mr-[10px]">

        {!user ? (
          <Link
            to="/login"
            className="inline-block px-[15px] py-[3px] text-base cursor-pointer bg-[#E53935] text-white rounded-[20px_1%] transition-all duration-300 hover:bg-[#F55A4E] hover:scale-110"
          >
            Log in
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className="inline-block px-[15px] py-[3px] text-base cursor-pointer bg-[#E53935] text-white rounded-[20px_1%] transition-all duration-300 hover:bg-[#F55A4E] hover:scale-110"
          >
            Log out
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;