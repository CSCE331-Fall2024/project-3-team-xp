import PandaLogo from '../assets/PandaLogo.png'
import { Link } from 'react-router-dom';
import SelectLang from '../translation/translationWidget'

const Navbar = () => {
  return (
    <nav className="top-0 left-0 w-full flex items-center justify-between bg-[#ffd5d5] px-[10px] py-[3px] z-[1000]">
      <div>
        <Link to="">
          <img src={PandaLogo} alt="Logo" className="h-[50px] w-auto p-0" />
        </Link>
      </div>

      <div className="flex-1 flex justify-center items-center space-x-[20px] ml-64">
        <Link
          to="/manager"
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
        <Link
          to="/login"
          className="inline-block px-[15px] py-[3px] text-base cursor-pointer bg-[#E53935] text-white rounded-[20px_1%] transition-all duration-300 hover:bg-[#F55A4E] hover:scale-110"
        >
          Log in
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;