import { useState } from "react";
import { Link } from "react-router-dom";
import { useOrder } from "../lib/orderContext";

const Order = () => {
  const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;

  const { order, reset } = useOrder();
  const [history, setHistory] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [customerName, setCustomerName] = useState("");

  const categories = ["Meals", "Sides", "Entrees", "Appetizers", "Drinks"];

  const confirmOrder = () => {
    setShowPopup(true);
  };

  const completeOrder = () => {

    console.log(order);

    const transactionData = {
      items: order,
      customer: customerName,
      customer_id: 1,
      employee: "self checkout"
    };

    console.log("Serialize data:", JSON.stringify(transactionData));

    fetch(`http://${VITE_SERVER_URL}/api/transactions/create`, {
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

  return (
    <div className="mt-10 flex flex-col items-center p-4 w-full mx-auto rounded-lg">
      <div className="grid grid-cols-5 gap-4 mt-4">
        {categories.map((category) => (
          <Link
            to={`${category}`}
            key={category}
            // onClick={() => setCurType(category)}
            className="px-4 py-2 text-xl font-bold rounded-lg bg-red-400 text-white hover:bg-red-500"
          >
            {category}
          </Link>
        ))}
      </div>

      <div className="flex mt-6 w-full space-x-6 max-w-2xl">
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
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg"
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
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-bold mb-4">Enter Order Details</h3>
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
            />
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
