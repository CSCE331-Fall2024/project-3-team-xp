import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../lib/orderContext';
import MenuItem from './MenuItem';

/**
 * Drinks Kiosk Component
 * 
 * Component that renders a list of drinks and allows the user to select them.
 * Fetches menu items from the backend and dynamically loads their images.
 */
function Drinks() {
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const [menuItems, setMenuItems] = useState([]);
    const [selectedDrinks, setSelectedDrinks] = useState([]);
    const [loadedImages, setLoadedImages] = useState({});
    const { addItemToOrder } = useOrder();
    const navigate = useNavigate();

    /**
     * Fetches menu items from the backend API and loads images for drink items.
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
     * Dynamically imports images for menu items based on their names.
     * @param {Array} items - List of menu items fetched from the backend.
     * @returns {Object} - A mapping of menu item names to their image URLs.
     */
    const loadImages = async (items) => {
        const images = {};
        for (const item of items) {
            if (item.category === 'Drink') {
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

    const drinks = menuItems.filter((item) => item.category === 'Drink');

    /**
     * Toggles selection for a given drink item.
     * @param {Object} drink - The selected drink item.
     */
    const handleDrinkSelection = (drink) => {
        const isSelected = selectedDrinks.includes(drink);
        setSelectedDrinks(isSelected ? selectedDrinks.filter((e) => e !== drink) : [...selectedDrinks, drink]);
    };

    /**
     * Determines if the confirm button should be enabled.
     * @returns {boolean} - True if at least one drink is selected.
     */
    const isConfirmEnabled = () => {
        return selectedDrinks.length > 0;
    };

    /**
     * Confirms the selected drinks by adding them to the order and navigating to the kiosk page.
     */
    const handleConfirm = () => {
        selectedDrinks.forEach((drink) => addItemToOrder(drink.menu_item_name));
    };

    return (
        <div>
            <div className="flex flex-col items-center p-4">
                <h1>Drinks</h1>
                <div className="flex flex-wrap justify-center gap-4">
                    {drinks.map((item) => (
                        <div key={item.menu_item_id} onClick={() => handleDrinkSelection(item)}>
                            <MenuItem
                                name={item.menu_item_name}
                                img={loadedImages[item.menu_item_name]}
                                selectEnabled={selectedDrinks !== null}
                                isSelected={selectedDrinks.includes(item)}
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

export default Drinks;