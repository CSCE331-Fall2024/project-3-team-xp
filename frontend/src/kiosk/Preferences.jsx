import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../lib/orderContext';
import MenuItem from './MenuItem';

/**
 * Recomendations Kiosk Component
 * 
 * The Recommendations component provides users with menu recommendations based on their preferences.
 */
function Recommendations() {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // State variables to hold menu items, selected preferences, loaded images, and filters.
  const [menuItems, setMenuItems] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [loadedImages, setLoadedImages] = useState({});
  const { addItemToOrder } = useOrder();
  const navigate = useNavigate();

  const [chicken, setChicken] = useState('');
  const [flavors, setFlavors] = useState([]);
  const [allergens, setAllergens] = useState([]);
  const [availableAllergens, setAvailableAllergens] = useState([]);
  const [calorieMin, setCalorieMin] = useState(0);
  const [calorieMax, setCalorieMax] = useState(1000);

  /**
   * Fetches available allergens from the backend and updates state.
   */
  useEffect(() => {
    fetchAllergens();
  }, []);

  /**
   * Fetches menu item recommendations based on user preferences.
   * It updates the menu items and loads their images.
   */
  useEffect(() => {
    fetchRecommendations();
  }, [chicken, flavors, allergens, calorieMin, calorieMax]);

  /**
   * Fetches available allergens data from the backend.
   * Updates the availableAllergens state with the fetched data.
   */
  const fetchAllergens = async () => {
    try {
      const response = await fetch(`${VITE_BACKEND_URL}/api/menuitems/availableAllergens`);
      if (response.ok) {
        const data = await response.json();
        setAvailableAllergens(data);
      } else {
        console.error("Failed to fetch allergens");
      }
    } catch (error) {
      console.error("Error fetching allergens:", error);
    }
  };

  /**
   * Fetches recommended menu items based on selected preferences.
   * Appends filters like chicken preference, flavors, allergens, and calorie range to the URL.
   * Updates the state with fetched menu items and their corresponding images.
   */
  const fetchRecommendations = async () => {
    try {
      const url = new URL(`${VITE_BACKEND_URL}/api/menuitems/preference`);
      url.searchParams.append('chicken', chicken);
      flavors.forEach((flavor) => url.searchParams.append('flavors', flavor));
      allergens.forEach((allergen) => url.searchParams.append('allergens', allergen));
      url.searchParams.append('calorie_min', calorieMin);
      url.searchParams.append('calorie_max', calorieMax);

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
        const images = await loadImages(data);
        setLoadedImages(images);
      } else {
        console.error("Failed to fetch recommendations");
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  /**
   * Loads images for each menu item.
   * The images are dynamically imported based on the menu item name.
   * @param {Array} items - List of menu items to load images for.
   * @returns {Object} - An object where the keys are menu item names and values are image URLs.
   */
  const loadImages = async (items) => {
    const images = {};
    for (const item of items) {
      const formattedName = item.menu_item_name.replace(/\s+/g, '');
      try {
        images[item.menu_item_name] = (await import(`../assets/${formattedName}.png`)).default;
      } catch (err) {
        console.warn(`Image not found for: ${formattedName}`, err);
      }
    }
    return images;
  };

  /**
   * Handles allergen checkbox changes.
   * Adds or removes allergens from the allergens list in the state.
   * @param {Object} event - The change event triggered by the allergen checkbox.
   */
  const handleAllergenChange = (event) => {
    const allergenId = parseInt(event.target.value, 10);
    setAllergens((prevAllergens) =>
      event.target.checked
        ? [...prevAllergens, allergenId]
        : prevAllergens.filter((id) => id !== allergenId)
    );
  };

  /**
   * Handles flavor checkbox changes.
   * Adds or removes flavors from the flavors list in the state.
   * @param {Object} event - The change event triggered by the flavor checkbox.
   */
  const handleFlavorChange = (event) => {
    const flavor = event.target.value;
    setFlavors((prevFlavors) =>
      event.target.checked
        ? [...prevFlavors, flavor]
        : prevFlavors.filter((f) => f !== flavor)
    );
  };

  /**
   * Handles item selection for preferences.
   * Toggles the selection of a menu item in the selectedPreferences state.
   * @param {Object} item - The menu item object that is being selected or deselected.
   */
  const handleItemSelection = (item) => {
    const isSelected = selectedPreferences.includes(item);
    setSelectedPreferences(
      isSelected
        ? selectedPreferences.filter((e) => e !== item)
        : [...selectedPreferences, item]
    );
  };

  /**
   * Determines if the button should be enabled.
   * @returns {boolean} - True if at least one item is selected, otherwise false.
   */
  const isConfirmEnabled = () => {
    return selectedPreferences.length > 0;
  };

  /**
   * Handles the confirmation of item selections.
   * Adds the selected items to the order and navigates to the kiosk page.
   */
  const handleConfirm = () => {
    selectedPreferences.forEach((pref) => addItemToOrder(pref.menu_item_name));
    console.log("Items added to order:", selectedPreferences);
    navigate("/kiosk");
  };

  return (
    <div className="text-center p-10">
      <h1 className="text-3xl font-bold p-4 text-red-500">Choose Your Preferences</h1>
      <div className="flex flex-row h-screen p-4">
        <div className="flex flex-col w-1/3 items-center space-y-4">
          <div
            className="flex flex-col items-center w-full p-4 border-4 border-transparent bg-red-200 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:bg-red-300"
          >
            <label className="font-semibold text-lg">Do you want chicken?</label>
            <select
              onChange={(e) => setChicken(e.target.value)}
              value={chicken}
              className="border border-gray-300 rounded-lg p-2 mt-2"
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div
            className="flex flex-col items-center w-full p-4 border-4 border-transparent bg-red-200 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:bg-red-300"
          >
            <label className="font-semibold text-lg">Flavor Preferences (select all that apply):</label>
            <div className="space-y-2 mt-2">
              {['Sweet', 'Spicy', 'Savory', 'Sour'].map((flavor) => (
                <label key={flavor} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={flavor}
                    onChange={handleFlavorChange}
                    className="form-checkbox"
                  />
                  <span>{flavor}</span>
                </label>
              ))}
            </div>
          </div>

          <div
            className="flex flex-col items-center w-full p-4 border-4 border-transparent bg-red-200 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:bg-red-300"
          >
            <h2 className="font-semibold text-lg">Allergens (select to exclude):</h2>
            <div className="space-y-2 mt-2">
              {availableAllergens.map((allergen) => (
                <label key={allergen.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={allergen.id}
                    onChange={handleAllergenChange}
                    className="form-checkbox"
                  />
                  <span>{allergen.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center w-full p-4 border-4 border-transparent bg-red-200 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:bg-red-300">
            <label className="font-semibold text-lg">Calorie Range:</label>
            <div className="space-y-4 mt-2 w-full">
              <div className="flex justify-between items-center">
                <label className="text-md">Min Calories: {calorieMin}</label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={calorieMin}
                  onChange={(e) => {
                    const newMin = parseInt(e.target.value);
                    if (newMin > calorieMax) {
                      setCalorieMax(newMin);
                    }
                    setCalorieMin(newMin);
                  }}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="text-md">Max Calories: {calorieMax}</label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={calorieMax}
                  onChange={(e) => {
                    const newMax = parseInt(e.target.value);
                    if (newMax < calorieMin) {
                      setCalorieMin(newMax);
                    }
                    setCalorieMax(newMax);
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!isConfirmEnabled()}
            className={`mt-4 py-2 px-4 bg-green-500 text-white rounded ${!isConfirmEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Confirm Selection
          </button>
        </div>

        <div className="flex flex-wrap flex-1 justify-center gap-4">
          {menuItems.map((item) => (
            <div key={item.menu_item_id} onClick={() => handleItemSelection(item)}>
              <MenuItem
                name={item.menu_item_name}
                img={loadedImages[item.menu_item_name]}
                selectEnabled={true}
                isSelected={selectedPreferences.includes(item)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Recommendations;