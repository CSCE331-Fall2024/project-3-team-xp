import { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

/**
 * OrderContext Authentication Component
 * 
 * Manages the state of a user's order and provides functions 
 * for modifying the order. It uses React Context to share the order state and related 
 * functionality across the application.
 * 
 * @param {Object} props - The component's props.
 * @param {React.ReactNode} props.children - The child components that will have access to the order context.
 */
export const OrderProvider = ({ children }) => {
  const [order, setOrder] = useState({});

  /**
   * Adds an item to the order or increments its quantity if it already exists.
   * 
   * @param {string} item - The name of the item to add to the order.
   */
  const addItemToOrder = (item) => {
    setOrder((prevOrder) => ({
      ...prevOrder,
      [item]: (prevOrder[item] || 0) + 1,
    }));
  };

  /**
   * Removes an item from the order or decrements its quantity. If the item's quantity 
   * becomes zero or less, it is removed from the order entirely.
   * 
   * @param {string} item - The name of the item to remove from the order.
   */
  const removeItemFromOrder = (item) => {
    setOrder((prevOrder) => {
      const updatedOrder = {
        ...prevOrder,
        [item]: (prevOrder[item] || 0) - 1,
      };

      if (updatedOrder[item] <= 0) {
        delete updatedOrder[item];
      }

      return updatedOrder;
    });
  };

  /**
   * Resets the order to an empty state.
   */
  const reset = () => setOrder({});

  return (
    <OrderContext.Provider value={{ order, addItemToOrder, removeItemFromOrder, reset }}>
      {children}
    </OrderContext.Provider>
  );
};

/**
 * Custom hook to access the order context.
 * Provides the order state and functions for interacting with the order.
 * 
 * @returns {Object} - The order context, containing the state and functions.
 */
export const useOrder = () => useContext(OrderContext);