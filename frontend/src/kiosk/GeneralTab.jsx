import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrder } from "../lib/orderContext";
import MenuItem from "./MenuItem";

function GeneralTab({ category }) {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loadedImages, setLoadedImages] = useState({});
  const { order, addItemToOrder, updateOrder } = useOrder();
  const [allergens, setAllergens] = useState([]);
  const [showAllergensPopup, setShowAllergensPopup] = useState(false);

  const navigate = useNavigate();

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

  const loadImages = async (items) => {
    const images = {};
    for (const item of items) {
      if (item.category === category) {
        const formattedName = item.menu_item_name.replace(/\s+/g, "");
        try {
          images[item.menu_item_name] = (await import(`../assets/${formattedName}.png`)).default;
        } catch (err) {
          console.warn(`Image not found for: ${formattedName}`, err);
          images[item.menu_item_name] = (await import("../assets/placeHolderImage.jpg")).default;
        }
      }
    }
    return images;
  };

  const filteredItems = menuItems.filter((item) => item.category === category);

  const handleItemSelection = (item) => {
    const isSelected = selectedItems.includes(item);
    setSelectedItems(isSelected ? selectedItems.filter((i) => i !== item) : [...selectedItems, item]);
  };

  const isConfirmEnabled = () => selectedItems.length > 0;

  const handleConfirm = () => {
    selectedItems.forEach((item) => addItemToOrder(item.menu_item_name));
    console.log(selectedItems);
  };

  const fetchAllergens = async (menuItemName) => {
    const menuItem = menuItems.find((item) => item.menu_item_name === menuItemName);
    if (menuItem) {
      setAllergens(menuItem.allergens);
      setShowAllergensPopup(true);
    }
  };

  return (
    <div>
      <button
        className="fixed top-20 left-4 bg-gray-300 text-black font-bold text-2xl rounded-full w-12 h-12 flex items-center justify-center bg-opacity-75 hover:scale-110 hover:bg-gray-400 transition-transform duration-200 ease-in-out"
        onClick={() => navigate(-1)}
      >
        {"<"}
      </button>
      <div className="flex flex-col items-center p-4">
        <h1 className="text-4xl font-extrabold text-[#F44336] font-serif tracking-wide p-4">{category}s</h1>
        <div className="flex flex-wrap justify-center gap-4">
          {filteredItems.map((item) => {
            const allergenNames = item.allergens?.map((allergen) => allergen.name).join(", ") || "";
            return (
              <div key={item.menu_item_id} onClick={() => handleItemSelection(item)}>
                <MenuItem
                  name={item.menu_item_name}
                  img={loadedImages[item.menu_item_name]}
                  selectEnabled={selectedItems !== null}
                  isSelected={selectedItems.includes(item)}
                  calories={item.calories}
                  onInfoClick={() => fetchAllergens(item.menu_item_name)}
                  hasAllergens={allergenNames}
                  order={order}
                  updateOrder={updateOrder}
                />
              </div>
            );
          })}
        </div>
        <button
          className={`mt-4 px-4 py-2 rounded ${isConfirmEnabled() ? "bg-green-500" : "bg-gray-400"}`}
          disabled={!isConfirmEnabled()}
          onClick={() => {
            handleConfirm();
            navigate("/kiosk");
          }}
        >
          Confirm
        </button>
      </div>
      {showAllergensPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setShowAllergensPopup(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4 text-center">Allergens</h3>
            <ul className="text-center">
              {allergens.map((allergen, index) => (
                <li key={index}>{allergen.name}</li>
              ))}
            </ul>
            <button
              onClick={() => setShowAllergensPopup(false)}
              className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GeneralTab;
