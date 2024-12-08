import React from "react";
import { Link } from "react-router-dom";
import MenuItems from '../assets/bigPlate.png';
import Employees from '../assets/employees.png';
import Ingredients from '../assets/ingredients.png';
import Reports from '../assets/reports.png';

function ManagerActions() {
  const actions = [
    { label: "Edit Employees", path: "/manager/employees", image: Employees },
    { label: "Edit Menu Items", path: "/manager/menuitems", image: MenuItems },
    { label: "Edit Ingredients", path: "/manager/ingredients", image: Ingredients },
    { label: "View Reports", path: "/manager/reports", image: Reports },
  ];

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-4xl font-extrabold text-[#F44336] font-serif mb-8">
        Manager Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
      {actions.map((action) => (
        <Link
          to={action.path}
          key={action.label}
          className="flex flex-col items-center justify-center group hover:bg-red-200 transition-all duration-300 rounded-lg transform hover:scale-125"
        >
          <div
            className="w-40 h-40 bg-cover bg-center rounded-lg mb-2"
            style={{ backgroundImage: `url(${action.image})` }}
          ></div>
          <span className="text-red-500 text-lg font-bold">
            {action.label}
          </span>
        </Link>
      ))}
      </div>
    </div>
  );
}

export default ManagerActions;