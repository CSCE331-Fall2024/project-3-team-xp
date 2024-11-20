import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../lib/orderContext';
import MenuItem from './MenuItem';

function Appetizers(){
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const [menuItems, setMenuItems] = useState([]);
    const [selectedApps, setSelectedApps] = useState([]);
    const [loadedImages, setLoadedImages] = useState({});
    const { addItemToOrder } = useOrder();

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

    const Apps = [];
    menuItems.forEach((item) => {
        if (item.category === 'Appetizer') Apps.push(item);
    });

    const handleAppSelection = (drink) => {
        setSelectedApps([drink]);
    };

    const isConfirmEnabled = () => {
        return selectedApps.length > 0;
    };


    const handleConfirm = () => {
        selectedApps.forEach((App) => addItemToOrder(App.menu_item_name));
        console.log(selectedApps)
    }

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