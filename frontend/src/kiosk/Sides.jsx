import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../lib/orderContext';
import MenuItem from './MenuItem';

/**
 * Sides Kiosk Component
 * 
 * The Sides component displays a list of side menu items for the user to select from.
 * It fetches the menu items from the backend, filters them by category, 
 * and allows the user to select side items to add to their order.
 */
function Sides() {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // State variables to hold menu items, selected sides, loaded images, and order context.
  const [menuItems, setMenuItems] = useState([]);
  const [selectedSides, setSelectedSides] = useState([]);
  const [loadedImages, setLoadedImages] = useState({});
  const { addItemToOrder } = useOrder();

  const navigate = useNavigate();

  /**
   * Fetches menu items from the backend and filters for sides.
   * Also loads the images for the side items.
   */
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`${VITE_BACKEND_URL}/api/menuitems/`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        setMenuItems(data);
        const images = await loadImages(data);
        setLoadedImages(images);
      } catch (err) {
        console.error("Error fetching menu items:", err);
      }
    };
    fetchMenuItems();
  }, []);

  /**
   * Loads images for side menu items.
   * The images are dynamically imported based on the menu item name.
   * @param {Array} items - List of menu items to load images for.
   * @returns {Object} - An object where the keys are menu item names and values are image URLs.
   */
  const loadImages = async (items) => {
    const images = {};
    for (const item of items) {
      if (item.category === 'Side') {
        const formattedName = item.menu_item_name.replace(/\s+/g, '');
        try {
          images[item.menu_item_name] = (await import(`../assets/${formattedName}.png`)).default;
        } catch (err) {
          console.warn(`Image not found for: ${formattedName}`, err);
        }
      }
    }
    return images;
  };

  // Filters the menu items for those belonging to the "Side" category.
  const sides = [];
  menuItems.forEach((item) => {
    if (item.category === 'Side') sides.push(item);
  });

  /**
   * Handles selection or deselection of a side item.
   * Adds or removes the side from the selectedSides array in the state.
   * @param {Object} side - The side item that is being selected or deselected.
   */
  const handleSideSelection = (side) => {
    const isSelected = selectedSides.includes(side);
    setSelectedSides(isSelected ? selectedSides.filter((e) => e !== side) : [...selectedSides, side]);
  };

  /**
   * Checks if at least one side item has been selected.
   * @returns {boolean} - True if at least one side item is selected, otherwise false.
   */
  const isConfirmEnabled = () => {
    return selectedSides.length > 0;
  };

  /**
   * Handles confirming the selection of sides.
   * Adds the selected side items to the order and logs the selection.
   */
  const handleConfirm = () => {
    selectedSides.forEach((side) => addItemToOrder(side.menu_item_name));
    console.log(selectedSides);
  };

  return (
    <div>
      <div className="flex flex-col items-center p-4">
        <h1>Sides</h1>
        <div className="flex flex-wrap justify-center gap-4">
          {sides.map((item) => (
            <div key={item.menu_item_id} onClick={() => handleSideSelection(item)}>
              <MenuItem
                name={item.menu_item_name}
                img={loadedImages[item.menu_item_name]}
                selectEnabled={selectedSides !== null}
                isSelected={selectedSides.includes(item)}
              />
            </div>
          ))}
        </div>
        <button
          className={`mt-4 px-4 py-2 rounded ${isConfirmEnabled() ? 'bg-green-500' : 'bg-gray-400'}`}
          disabled={!isConfirmEnabled()}
          onClick={() => {
            handleConfirm();
            navigate("/kiosk");
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

export default Sides;