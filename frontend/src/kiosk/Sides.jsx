import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../lib/orderContext';
import MenuItem from './MenuItem';

function Sides(){
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const [menuItems, setMenuItems] = useState([]);
    const [selectedSides, setSelectedSides] = useState([]);
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

    const sides = [];
    menuItems.forEach((item) => {
        if (item.category === 'Side') sides.push(item);
    });

    const handleSideSelection = (side) => {
        const isSelected = selectedSides.includes(side);
        setSelectedSides(isSelected ? selectedSides.filter((e) => e !== side) : [...selectedSides, side]);
    };

    const isConfirmEnabled = () => {
        return selectedSides.length > 0;
    };


    const handleConfirm = () => {
        selectedSides.forEach((side) => addItemToOrder(side.menu_item_name));
        console.log(selectedSides)
    }

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