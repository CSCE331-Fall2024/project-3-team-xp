import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../lib/orderContext';
import MenuItem from './MenuItem';

function Recommendations(){
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const [menuItems, setMenuItems] = useState([]);
    const [selectedDrinks, setSelectedDrinks] = useState([]);
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

    const drinks = [];
    menuItems.forEach((item) => {
        if (item.category === 'Drink') drinks.push(item);
    });

    const handleDrinkSelection = (drink) => {
        const isSelected = selectedDrinks.includes(drink);
        setSelectedDrinks(isSelected ? selectedDrinks.filter((e) => e !== drink) : [...selectedDrinks, drink]);
    };

    const isConfirmEnabled = () => {
        return selectedDrinks.length > 0;
    };


    const handleConfirm = () => {
        selectedDrinks.forEach((drink) => addItemToOrder(drink.menu_item_name));
        console.log(selectedDrinks)
    }

    return (
        <div>
            <div className="flex flex-col items-center p-4">
                <h1>Thing</h1>
            </div>
        </div>
    );
}

export default Recommendations;