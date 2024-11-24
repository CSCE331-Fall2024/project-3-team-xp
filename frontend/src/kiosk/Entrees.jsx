import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../lib/orderContext';
import MenuItem from './MenuItem';

function Entrees(){
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const [menuItems, setMenuItems] = useState([]);
    const [selectedEntrees, setSelectedEntrees] = useState([]);
    const [loadedImages, setLoadedImages] = useState({});
    const { addItemToOrder } = useOrder();
    const [allergens, setAllergens] = useState([]);
    const [showAllergensPopup, setShowAllergensPopup] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await fetch(`${VITE_BACKEND_URL}/api/menuitems/`);
                if (!response.ok) throw new Error(`Error: ${response.status}`);
                const data = await response.json();
                
                // Add has_allergens check for each item
                const itemsWithAllergensCheck = await Promise.all(data.map(async (item) => {
                    const allergensResponse = await fetch(`${VITE_BACKEND_URL}/api/menuitems/allergens?menu_item_name=${item.menu_item_name}`);
                    const allergenData = await allergensResponse.json();
                    return {
                        ...item,
                        has_allergens: allergenData && allergenData.length > 0
                    };
                }));
                
                setMenuItems(itemsWithAllergensCheck);
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
            if (item.category === 'Entree') {
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

    const entrees = [];
    menuItems.forEach((item) => {
        if (item.category === 'Entree') entrees.push(item);
    });

    const handleEntreeSelection = (entree) => {
        const isSelected = selectedEntrees.includes(entree);
        setSelectedEntrees(isSelected ? selectedEntrees.filter((e) => e !== entree) : [...selectedEntrees, entree]);
    };

    const isConfirmEnabled = () => {
        return selectedEntrees.length > 0;
    };


    const handleConfirm = () => {
        selectedEntrees.forEach((entree) => addItemToOrder(entree.menu_item_name));
        console.log(selectedEntrees)
    }

    const fetchAllergens = async (menuItemName) => {
        try {
            const response = await fetch(`${VITE_BACKEND_URL}/api/menuitems/allergens?menu_item_name=${menuItemName}`);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setAllergens(data);
            setShowAllergensPopup(true);
        } catch (err) {
            console.error("Error fetching allergens:", err);
        }
    };

    return (
        <div>
            <div className="flex flex-col items-center p-4">
                <h1>Entrees</h1>
                <div className="flex flex-wrap justify-center gap-4">
                    {entrees.map((item) => (
                        <div key={item.menu_item_id} onClick={() => handleEntreeSelection(item)}>
                            <MenuItem
                                name={item.menu_item_name}
                                img={loadedImages[item.menu_item_name]}
                                selectEnabled={selectedEntrees !== null}
                                isSelected={selectedEntrees.includes(item)}
                                calories={item.calories}
                                onInfoClick={() => fetchAllergens(item.menu_item_name)}
                                hasAllergens={item.has_allergens}
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
                                <li key={index}>{allergen}</li>
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

export default Entrees;