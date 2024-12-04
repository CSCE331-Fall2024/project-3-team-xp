import MenuItem from './MenuItem';
import { useEffect, useState } from 'react';
import Bowl from '../assets/bowl.png';
import Plate from '../assets/plate.png';
import BigPlate from '../assets/bigPlate.png';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../lib/orderContext';

/**
 * Meals Kiosk Component
 * 
 * Component for selecting meal types (bowl, plate, big plate) and corresponding entrees/sides.
 * Dynamically fetches menu items and loads images for display.
 */
const Meals = () => {
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const [menuItems, setMenuItems] = useState([]);
    const [loadedImages, setLoadedImages] = useState({});
    const [selectedMealType, setSelectedMealType] = useState(null);
    const [selectedEntrees, setSelectedEntrees] = useState([]);
    const [selectedSides, setSelectedSides] = useState([]);
    const { addItemToOrder } = useOrder();
    const navigate = useNavigate();

    /**
     * Fetches menu items from the backend API and loads their images.
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
     * Dynamically imports images for entree and side items based on their names.
     * @param {Array} items - List of menu items fetched from the backend.
     * @returns {Object} - A mapping of menu item names to their image URLs.
     */
    const loadImages = async (items) => {
        const images = {};
        for (const item of items) {
            if (item.category === 'Entree' || item.category === 'Side') {
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

    const categorizedItems = { Entrees: [], Sides: [] };
    menuItems.forEach((item) => {
        if (item.category === 'Entree') categorizedItems.Entrees.push(item);
        if (item.category === 'Side') categorizedItems.Sides.push(item);
    });

    /**
     * Handles selection of a meal type (bowl, plate, or big plate).
     * Resets selected entrees and sides when a new meal type is chosen.
     * @param {string} meal - The selected meal type.
     */
    const handleMealSelection = (meal) => {
        setSelectedMealType(meal);
        setSelectedEntrees([]);
        setSelectedSides([]);
    };

    /**
     * Handles selection or deselection of an entree or side item.
     * @param {Object} item - The selected menu item.
     */
    const handleItemSelection = (item) => {
        const isEntree = item.category === 'Entree';
        const isSelected = selectedEntrees.includes(item) || selectedSides.includes(item);

        if (selectedMealType === 'bowl') {
            if (isEntree) {
                setSelectedEntrees(isSelected ? [] : [item]);
            }
        } else if (selectedMealType === 'plate') {
            if (isEntree && selectedEntrees.length < 1) {
                setSelectedEntrees([item]);
            } else if (!isEntree && selectedSides.length < 1) {
                setSelectedSides([item]);
            } else if (isSelected) {
                if (isEntree) {
                    setSelectedEntrees([]);
                } else {
                    setSelectedSides([]);
                }
            }
        } else if (selectedMealType === 'big plate') {
            if (isEntree && selectedEntrees.length < 2) {
                setSelectedEntrees(isSelected ? selectedEntrees.filter((e) => e !== item) : [...selectedEntrees, item]);
            } else if (!isEntree && selectedSides.length < 1) {
                setSelectedSides([item]);
            } else if (isSelected) {
                if (isEntree) {
                    setSelectedEntrees(selectedEntrees.filter((e) => e !== item));
                } else {
                    setSelectedSides([]);
                }
            }
        }
    };

    /**
     * Determines if the confirm button should be enabled based on meal selection.
     * @returns {boolean} - True if the selected meal meets the required criteria.
     */
    const isConfirmEnabled = () => {
        if (selectedMealType === 'bowl') return selectedEntrees.length === 1;
        if (selectedMealType === 'plate') return selectedEntrees.length === 1 && selectedSides.length === 1;
        if (selectedMealType === 'big plate') return selectedEntrees.length === 2 && selectedSides.length === 1;
        return false;
    };

    /**
     * Confirms the selected meal items by adding them to the order and navigating to the kiosk page.
     */
    const handleConfirm = () => {
        selectedEntrees.forEach((entree) => addItemToOrder(entree.menu_item_name));
        selectedSides.forEach((side) => addItemToOrder(side.menu_item_name));
    };

    return (
        <div>
            <div className="flex flex-row gap-4 justify-center mt-4">
                <button onClick={() => handleMealSelection('bowl')}>
                    <MenuItem name="bowl" img={Bowl} selectEnabled isSelected={selectedMealType === "bowl"} />
                </button>
                <button onClick={() => handleMealSelection('plate')}>
                    <MenuItem name="plate" img={Plate} selectEnabled isSelected={selectedMealType === "plate"} />
                </button>
                <button onClick={() => handleMealSelection('big plate')}>
                    <MenuItem name="big plate" img={BigPlate} selectEnabled isSelected={selectedMealType === "big plate"} />
                </button>
            </div>
            <div className="flex flex-col items-center p-4">
                <h1>Sides</h1>
                <div className="flex flex-wrap justify-center gap-4">
                    {categorizedItems.Sides.map((item) => (
                        <div key={item.menu_item_id} onClick={() => handleItemSelection(item)}>
                            <MenuItem
                                name={item.menu_item_name}
                                img={loadedImages[item.menu_item_name]}
                                selectEnabled={selectedMealType !== null}
                                isSelected={selectedSides.includes(item)}
                            />
                        </div>
                    ))}
                </div>
                <h1>Entrees</h1>
                <div className="flex flex-wrap justify-center gap-4">
                    {categorizedItems.Entrees.map((item) => (
                        <div key={item.menu_item_id} onClick={() => handleItemSelection(item)}>
                            <MenuItem
                                name={item.menu_item_name}
                                img={loadedImages[item.menu_item_name]}
                                selectEnabled={selectedMealType !== null}
                                isSelected={selectedEntrees.includes(item)}
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
};

export default Meals;