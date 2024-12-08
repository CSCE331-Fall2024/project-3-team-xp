import MenuItem from './MenuItem';
import { useEffect, useState } from 'react';
import Bowl from '../assets/bowl.png';
import Plate from '../assets/plate.png';
import BigPlate from '../assets/bigPlate.png';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../lib/orderContext';

const Meals = () => {
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const [menuItems, setMenuItems] = useState([]);
    const [loadedImages, setLoadedImages] = useState({});
    const [selectedMealType, setSelectedMealType] = useState(null);
    const [selectedEntrees, setSelectedEntrees] = useState([]);
    const [selectedSides, setSelectedSides] = useState([]);
    const [allergens, setAllergens] = useState([]);
    const [showAllergensPopup, setShowAllergensPopup] = useState(false);
    const { order, addItemToOrder, updateOrder } = useOrder();

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
            if (item.category === 'Entree' || item.category === 'Side') {
                const formattedName = item.menu_item_name.replace(/\s+/g, '');
                try {
                    images[item.menu_item_name] = (await import(`../assets/${formattedName}.png`)).default;
                } catch (err) {
                    console.warn(`Image not found for: ${formattedName}`, err);
                    images[item.menu_item_name] = (await import('../assets/placeHolderImage.jpg')).default;
                }
            }
        }
        return images;
    };

    const fetchAllergens = async (menuItemName) => {
        // Find the menu item and use its pre-fetched allergens
        const menuItem = menuItems.find(item => item.menu_item_name === menuItemName);
        if (menuItem) {
            setAllergens(menuItem.allergens);
            setShowAllergensPopup(true);
        }
    };

    const categorizedItems = { Entrees: [], Sides: [] };
    menuItems.forEach((item) => {
        if (item.category === 'Entree') categorizedItems.Entrees.push(item);
        if (item.category === 'Side') categorizedItems.Sides.push(item);
    });

    const handleMealSelection = (meal) => {
        setSelectedMealType(meal);
        setSelectedEntrees([]);
        setSelectedSides([]);
    };

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

    const isConfirmEnabled = () => {
        if (selectedMealType === 'bowl') return selectedEntrees.length === 1;
        if (selectedMealType === 'plate') return selectedEntrees.length === 1 && selectedSides.length === 1;
        if (selectedMealType === 'big plate') return selectedEntrees.length === 2 && selectedSides.length === 1;
        return false;
    };

    const handleConfirm = () => {
        selectedEntrees.forEach((entree) => addItemToOrder(entree.menu_item_name));
        selectedSides.forEach((side) => addItemToOrder(side.menu_item_name));
        console.log(selectedEntrees, selectedSides)
    }

    return (
        <div>
            <button
            className="fixed top-20 left-4 bg-gray-300 text-black font-bold text-2xl rounded-full w-12 h-12 flex items-center justify-center bg-opacity-75 hover:scale-110 hover:bg-gray-400 transition-transform duration-200 ease-in-out"
            onClick={() => navigate(-1)}
            >
            {"<"}
            </button>
            <h1 className="flex justify-center text-4xl font-extrabold text-[#F44336] font-serif tracking-wide">Meal</h1>
            <div className='flex flex-row gap-4 justify-center mt-4'>
                <button onClick={() => handleMealSelection('bowl')}>
                    <MenuItem name='bowl' img={Bowl} selectEnabled isSelected={selectedMealType === "bowl" } order={order} updateOrder={updateOrder} />
                </button>
                <button onClick={() => handleMealSelection('plate')}>
                    <MenuItem name='plate' img={Plate} selectEnabled isSelected={selectedMealType === "plate"} order={order} updateOrder={updateOrder}/>
                </button>
                <button onClick={() => handleMealSelection('big plate')}>
                    <MenuItem name='big plate' img={BigPlate} selectEnabled isSelected={selectedMealType === "big plate"} order={order} updateOrder={updateOrder}/>
                </button>
            </div>
            <div className="flex flex-col items-center p-4">
                <h1 className="text-4xl font-extrabold text-[#F44336] font-serif tracking-wide">Sides</h1>
                <div className="flex flex-wrap justify-center gap-4">
                    {categorizedItems.Sides.map((item) => {
                        const allergenNames = item.allergens?.map((allergen) => allergen.name).join(', ') || '';

                        return (
                            <div key={item.menu_item_id} onClick={() => handleItemSelection(item)}>
                                <MenuItem
                                    name={item.menu_item_name}
                                    img={loadedImages[item.menu_item_name]}
                                    selectEnabled={selectedMealType !== null}
                                    isSelected={selectedSides.includes(item)}
                                    calories={item.calories}
                                    onInfoClick={() => fetchAllergens(item.menu_item_name)}
                                    hasAllergens={allergenNames}
                                    order={order}
                                    updateOrder={updateOrder}
                                />
                            </div>
                        )
                    })}
                </div>
                <h1 className="text-4xl font-extrabold text-[#F44336] font-serif tracking-wide">Entrees</h1>
                <div className="flex flex-wrap justify-center gap-4">
                    {categorizedItems.Entrees.map((item) => {
                        const allergenNames = item.allergens?.map((allergen) => allergen.name).join(', ') || '';

                        return (
                            <div key={item.menu_item_id} onClick={() => handleItemSelection(item)}>
                                <MenuItem
                                    name={item.menu_item_name}
                                    img={loadedImages[item.menu_item_name]}
                                    selectEnabled={selectedMealType !== null}
                                    isSelected={selectedEntrees.includes(item)}
                                    calories={item.calories}
                                    onInfoClick={() => fetchAllergens(item.menu_item_name)}
                                    hasAllergens={allergenNames}
                                    order={order}
                                    updateOrder={updateOrder}
                                />
                            </div>
                        )
                    })}
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
                        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside popup
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
};

export default Meals;