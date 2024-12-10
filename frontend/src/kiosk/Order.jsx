import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useOrder } from "../lib/orderContext";
import { useAuth } from "../lib/AuthContext";
import MenuItem from './MenuItem';
import MealsImage from '../assets/bigPlate.png';
import SidesImage from '../assets/ApplePieRoll.png';
import EntreesImage from '../assets/bowl.png';
import DrinksImage from '../assets/water.png';
import AppetizersImage from '../assets/Rangoons.png';
import PreferencesImage from '../assets/recommendations.png';
import RewardsImage from '../assets/rewards-icon.jpg'
import { useRewards } from "../lib/RewardsContext";
import { discounts } from "./Rewards";

/**
 * Order Kiosk main Component
 * 
 * Represents the Order component where users can view and modify their current order, see recommendations, 
 * and complete their order.
 */
const Order = () => {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const { order, resetOrder, updateOrder } = useOrder();
  const [history, setHistory] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const { user, setUser } = useAuth();
  const { addItemToOrder, removeItemFromOrder } = useOrder();

  const [customerId, setCustomerId] = useState("");
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [selectedRecommendations, setSelectedRecommendations] = useState([]);
  const [loadedImages, setLoadedImages] = useState({});
  const [price, setPrice] = useState(0);

  const { appliedRewards, setAppliedRewards } = useRewards();

  const [categories, setCategories] = useState([
    "Meals",
    "Sides",
    "Entrees",
    "Appetizers",
    "Drinks",
    "Preferences",
  ]);

  const [entrees, setEntrees] = useState([]);
  const [discountPoints, setDiscountPoints] = useState(0);

  useEffect(() => {
    if (user) {
      setCustomerName(user.name);
      setCustomerId(user.id);
      setCategories((prevCategories) => {
        if (!prevCategories.includes("Rewards")) {
          return [...prevCategories, "Rewards"];
        }
        return prevCategories;
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`${VITE_BACKEND_URL}/api/menuitems/`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        setEntrees(data
          .filter(item => item.category === "Entree" && item.active)
          .map(item => item.menu_item_name));
      } catch (err) {
        console.error("Error fetching menu items:", err);
      }
    };
    fetchMenuItems();
  }, []);

  // Mapping category names to their respective images
  const categoryImages = {
    Meals: MealsImage,
    Sides: SidesImage,
    Entrees: EntreesImage,
    Drinks: DrinksImage,
    Appetizers: AppetizersImage,
    Preferences: PreferencesImage,
    Rewards: RewardsImage
  };

  /**
   * Opens the confirmation popup when the order is ready to be finalized.
   */
  const confirmOrder = () => {
    setShowPopup(true);
  };

  useEffect(() => {

    const calculatePrice = () => {

      const priceCalculationData = {
        items: order,
      }

      fetch(`${VITE_BACKEND_URL}/api/transactions/price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(priceCalculationData),
      }).then((response) => {
        if (!response.ok) {
          alert("Something went wrong with your order.");
          throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
      }).then((data) => {
        const price = Math.round(data.price * 100) / 100;

        const { newPrice, points } = discounts(appliedRewards, price, order, entrees);
        setPrice(newPrice);
        setDiscountPoints(points);

        setHistory([`${customerName} ... $${price}`, ...history]);
      }).catch((error) => {
        console.error('Error:', error);
      });

      setShowPopup(false);
    }

    calculatePrice();
  }, [order, entrees]);

  const fetchPoints = async () => {
    try {
      const response = await fetch(`${VITE_BACKEND_URL}/api/transactions/points?user_id=${user.id}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setUser(prevUser => ({
          ...prevUser,
          current_points: data[0].current_points,
          total_points: data[0].total_points,
        }));
      }

    } catch (err) {
      console.error("Error fetching menu items:", err);
    }
  };

  /**
   * Completes the order by sending the order data to the backend API and updating the order history.
   */
  const completeOrder = () => {
    const transactionData = {
      items: order,
      customer: customerName,
      customer_id: user ? user.id : null,
      employee: "N/A",
      total_price: price,
      discount_points: discountPoints
    };

    console.log(transactionData);

    fetch(`${VITE_BACKEND_URL}/api/transactions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    }).then((response) => {
      if (!response.ok) {
        alert("Something went wrong with your order.");
        throw new Error(`Server error: ${response.status}`);
      }
      return response.json();
    }).then((data) => {
      const price = Math.round(data.total_price * 100) / 100;
      setHistory([`${customerName} ... $${price}`, ...history]);
      setAppliedRewards("");
      resetOrder();

      fetchPoints();
    }).catch((error) => {
      console.error('Error:', error);
    });

    setShowPopup(false);
  };

  /**
   * Handles the selection or removal of items from the recommended items list.
   * 
   * @param {Object} item - The menu item to be selected or removed.
   */
  const handleItemSelection = (item) => {
    const isSelected = selectedRecommendations.includes(item);
    if (isSelected) {
      removeItemFromOrder(item.menu_item_name);
    } else {
      addItemToOrder(item.menu_item_name);
    }
    setSelectedRecommendations(isSelected ? selectedRecommendations.filter((e) => e !== item) : [...selectedRecommendations, item]);
  };

  /**
   * Loads the images for the menu items dynamically based on their names.
   * 
   * @param {Array} items - The list of menu items to load images for.
   * @returns {Object} A dictionary of menu item names to image URLs.
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
   * Fetches recommended menu items for the user from the backend API.
   */
  useEffect(() => {
    if (!customerId) return;
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/menuitems/recommendations?customerId=${customerId}`);
        if (response.ok) {
          const data = await response.json();
          setRecommendedItems(data);
          const images = await loadImages(data);
          setLoadedImages(images);
        } else {
          console.error("Failed to fetch recommendations");
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };
    fetchRecommendations();
  }, [customerId]);

  return (
    <div className="mt-10 flex flex-col items-center p-4 w-full mx-auto rounded-lg">
      <div className="flex flex-flow gap-4 mt-4">
        {categories.map((category) => {
          return (
            <Link
              to={`${category}`}
              key={category}
              className="flex flex-col items-center justify-center group hover:bg-red-200 transition-all duration-300 rounded-lg"
            >
              <div
                className="w-40 h-40 bg-cover bg-center rounded-lg mb-2"
                style={{ backgroundImage: `url(${categoryImages[category]})` }} // Dynamically set the background image
              ></div>
              <span className="text-red-500 text-lg font-bold">
                {category}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="flex mt-6 w-full space-x-6 max-w-5xl">
        <div className="flex flex-col w-1/2 p-4 bg-white shadow-lg rounded-lg border-2 border-red-500">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Current Order</h2>
          <div className="overflow-y-auto h-60 mb-4">
            {Object.entries(order).map(([item, count]) => (
              <div key={item} className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-lg text-gray-700">{item}</span>
                <span className="text-lg text-gray-500">x {count}</span>
              </div>
            ))}
          </div>

          {user ? (
            <>
              <div className="flex justify-between mb-2 text-lg text-gray-700">
                <span>Current Points:</span>
                <span className="font-semibold">{user.current_points}</span>
              </div>
              <div className="flex justify-between mb-2 text-lg text-gray-700">
                <span>Total Points:</span>
                <span className="font-semibold">{user.total_points}</span>
              </div>
            </>
          ) : (
            <div className="mb-4 text-lg text-gray-700">
              You are currently ordering as a guest.
            </div>
          )}

          {appliedRewards && (
            <div className="flex justify-between items-center text-lg text-green-600 mb-2">
              <span>Applied Coupon:</span>
              <span className="font-semibold">{appliedRewards}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-lg text-gray-800 mb-4">
            <span>Current Price:</span>
            <span className="font-semibold text-xl">${price.toFixed(2)}</span>
          </div>

          <button
            onClick={confirmOrder}
            className="mt-auto px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none"
          >
            Confirm Order
          </button>
        </div>

        <div className="flex flex-col w-1/2 p-4 bg-white shadow-lg rounded-lg border-2 border-red-500">
          <h2 className="text-2xl font-semibold mb-4 text-center">Recommended Orders</h2>
          <div className="grid grid-cols-3 gap-4">
            {recommendedItems.map((item) => (
              <div key={item.menu_item_id} onClick={() => handleItemSelection(item)}>
                <MenuItem
                  name={item.menu_item_name}
                  img={loadedImages[item.menu_item_name]}
                  selectEnabled={true}
                  isSelected={selectedRecommendations.includes(item)}
                  order={order}
                  updateOrder={updateOrder}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-bold mb-4">Enter Order Details</h3>
            {user ? (
              <>
                Customer
                <div className="w-full p-2 border border-gray-300 rounded-lg mb-4 bg-gray-200">
                  {user.name}
                </div>
              </>
            ) : (
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mb-4"
              />
            )}
            <button
              onClick={completeOrder}
              className="w-full py-2 bg-green-500 text-white rounded-lg"
            >
              Save
            </button>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-2 w-full py-2 bg-red-500 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;