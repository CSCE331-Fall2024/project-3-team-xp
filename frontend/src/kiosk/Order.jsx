import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useOrder } from "../lib/orderContext";
import { useAuth } from "../lib/AuthContext";
import MenuItem from './MenuItem';

const Order = () => {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const { order, reset } = useOrder();
  const [history, setHistory] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const { user } = useAuth();
  const { addItemToOrder, removeItemFromOrder } = useOrder();

  const [customerId, setCustomerId] = useState("");
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [selectedRecommendations, setSelectedRecommendations] = useState([]);
  const [loadedImages, setLoadedImages] = useState({});

  useEffect(() => {
    if (user) {
      setCustomerName(user.name);
      setCustomerId(user.id);
    }
  }, [user])

  const categories = ["Meals", "Sides", "Entrees", "Appetizers", "Drinks", "Preferences"];

  const confirmOrder = () => {
    setShowPopup(true);
  };

  const completeOrder = () => {
    console.log(order);

    const transactionData = {
      items: order,
      customer: customerName,
      customer_id: user ? user.id : null,
      employee: "N/A"
    };

    console.log("Serialize data:", JSON.stringify(transactionData));

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
      console.log('Transaction successful:', data);
      const price = Math.round(data.total_price * 100) / 100;
      setHistory([`${customerName} ... $${price}`, ...history]);
      reset();
    }).catch((error) => {
      console.error('Error:', error);
    });

    setShowPopup(false);
  };

  const handleItemSelection = (item) => {
    const isSelected = selectedRecommendations.includes(item);
    if (isSelected) {
      removeItemFromOrder(item.menu_item_name);
    }
    else {
      addItemToOrder(item.menu_item_name);
    }
    setSelectedRecommendations(isSelected ? selectedRecommendations.filter((e) => e !== item) : [...selectedRecommendations, item]);
  };

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
      <div className="grid grid-cols-5 gap-4 mt-4">
        {categories.map((category) => (
          <Link
            to={`${category}`}
            key={category}
            className="px-4 py-2 text-xl font-bold rounded-lg bg-red-400 text-white hover:bg-red-500"
          >
            {category}
          </Link>
        ))}
      </div>

      <div className="flex mt-6 w-full space-x-6 max-w-5xl">
        <div className="flex flex-col w-1/2 p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Current Order</h2>
          <div className="overflow-y-auto h-60">
            {Object.entries(order).map(([item, count]) => (
              <div key={item} className="flex justify-between">
                <span>{item}</span>
                <span>x {count}</span>
              </div>
            ))}
          </div>
          <button
            onClick={confirmOrder}
            className="mt-auto px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Confirm Order
          </button>
        </div>

        <div className="flex flex-col w-1/2 p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Order History</h2>
          <div className="overflow-y-auto h-60">
            {history.map((record, index) => (
              <div key={index} className="flex justify-between">
                <span>{record}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col w-1/2 p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Recommended Orders</h2>
          <div className="grid grid-cols-2 gap-4">
            {recommendedItems.map((item) => (
              <div key={item.menu_item_id} onClick={() => handleItemSelection(item)}>
                <MenuItem
                  name={item.menu_item_name}
                  img={loadedImages[item.menu_item_name]}
                  selectEnabled={true}
                  isSelected={selectedRecommendations.includes(item)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>


      {user ? (
        <div>
          Current Points: {user.current_points},
          Total Points: {user.total_points},
          user id: {user.id}
        </div>
      ) : (
        <div>
          You are currently ordering as a guest.
        </div>
      )}

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
