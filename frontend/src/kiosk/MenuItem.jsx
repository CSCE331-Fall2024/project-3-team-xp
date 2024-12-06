import { useState } from 'react';
import informationIcon from '../assets/informationIcon.png';
import { useLocation } from "react-router-dom";


/**
 * Represents an item button component
 * @param {string} name - Name of the item
 * @param {string} img - URL of the item's image
 * @param {boolean} selectEnabled - Whether the item can be selected
 * @param {boolean} isSelected - Whether the item is currently selected
 * @param {number} calories - Calories of the item
 * @param {function} onInfoClick - Function to handle info icon click
 * @param {boolean} hasAllergens - Whether the item has allergens
 * @param {object} order - The current order (key-value pairs of item names and quantities)
 * @param {function} updateOrder - Function to update the order with new quantities
 */
const MenuItem = ({
  name,
  img,
  selectEnabled,
  isSelected,
  calories,
  onInfoClick,
  hasAllergens,
  order,
  updateOrder,
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const currentQuantity = order[name] || 0; // Get the current quantity of the item from the order

  const size = 150;
  const loc = useLocation();

  // Handle double-click to show the popup and toggle selection
  const handleDoubleClick = () => {
    if(loc.pathname == "/kiosk/Meals"){
        return;
    }
    setShowPopup(true);
  };

  // Handle increment or decrement of the quantity
  const adjustQuantity = (amount) => {
    if(currentQuantity + amount >= 0){
        updateOrder(name, currentQuantity + amount)
    }
  };

  return (
    <div
      className="relative flex flex-col dark:bg-white items-center border-2 rounded-md transition-all duration-300 ease-in-out"
      style={{
        width: size,
        height: size + 40,
        borderColor: isSelected ? 'green' : 'gray', // Border color based on selection
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: size,
          height: size,
          backgroundImage: `url(${img})`,
          backgroundSize: `${(2 * size) / 3}px ${(2 * size) / 3}px`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        onDoubleClick={selectEnabled ? handleDoubleClick : null} // Handle double-click
      />
      {hasAllergens && (
        <img
          src={informationIcon}
          alt="Info"
          className="absolute top-1 right-1 cursor-pointer"
          style={{ width: 20, height: 20 }}
          onClick={(e) => {
            e.stopPropagation();
            onInfoClick();
          }}
        />
      )}
      <div className="text-center p-1">
        <span className="text-sm font-serif">{name}</span>
        <br />
        {calories && <span className="text-xs text-gray-500">{calories} cal</span>}
      </div>

      {/* Popup for adjusting quantity */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 transform transition-all duration-500 ease-in-out">
            <h3 className="text-lg font-bold mb-4 text-center">
              Adjust Quantity for {name}
            </h3>
            <div className="flex justify-center items-center mb-4">
              <button
                onClick={() => adjustQuantity(-1)} // Decrease quantity
                disabled={currentQuantity <= 0} // Disable if quantity is 0
                className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:bg-gray-300"
              >
                -
              </button>
              <span className="px-6 text-xl">{currentQuantity}</span> {/* Display current quantity */}
              <button
                onClick={() => adjustQuantity(1)} // Increase quantity
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                +
              </button>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowPopup(false)} // Close the popup
                className="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowPopup(false)} // Confirm the order change
                className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItem;