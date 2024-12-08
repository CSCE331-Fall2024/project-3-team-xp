import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../lib/orderContext';
import MenuItem from './MenuItem';

/**
 * Appetizers Kiosk Component
 * 
 * Component that renders a list of appetizers and allows the user to select them.
 * Fetches menu items from the backend and dynamically loads their images.
 */
function Appetizers() {
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const [menuItems, setMenuItems] = useState([]);
    const [selectedApps, setSelectedApps] = useState([]);
    const [loadedImages, setLoadedImages] = useState({});
    const { addItemToOrder } = useOrder();
    const navigate = useNavigate();

    /**
     * Fetches menu items from the backend API and loads images for appetizer items.
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
            if (item.category === 'Appetizer') {
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

    /**
     * Toggles selection for a given appetizer item.
     * @param {Object} app - The selected appetizer item.
     */
    const handleAppSelection = (app) => {
        const isSelected = selectedApps.includes(app);
        setSelectedApps(isSelected ? selectedApps.filter((e) => e !== app) : [...selectedApps, app]);
    };

    /**
     * Determines if the confirm button should be enabled.
     * @returns {boolean} - True if at least one appetizer is selected.
     */
    const isConfirmEnabled = () => {
        return selectedApps.length > 0;
    };

    /**
     * Confirms the selected appetizers by adding them to the order and navigating to the kiosk page.
     */
    const handleConfirm = () => {
        selectedApps.forEach((app) => addItemToOrder(app.menu_item_name));
    };

    const Apps = menuItems.filter((item) => item.category === 'Appetizer');

    return (
        <div>
            <div className="flex flex-col items-center p-4">
                <h1>Appetizers</h1>
                <div className="flex flex-wrap justify-center gap-4">
                    {Apps.map((item) => (
                        <div key={item.menu_item_id} onClick={() => handleAppSelection(item)}>
                            <MenuItem
                                name={item.menu_item_name}
                                img={loadedImages[item.menu_item_name]}
                                selectEnabled={selectedApps !== null}
                                isSelected={selectedApps.includes(item)}
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

export default Appetizers;