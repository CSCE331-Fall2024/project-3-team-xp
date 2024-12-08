import { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [order, setOrder] = useState({});

  const addItemToOrder = (item) => {
    setOrder((prevOrder) => ({
      ...prevOrder,
      [item]: (prevOrder[item] || 0) + 1,
    }));
  };

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

  const updateOrder = (itemName, quantity) => {
    setOrder((prevOrder) => ({
      ...prevOrder,
      [itemName]: quantity,
    }));
  };

  const reset = () => setOrder({});

  return (
    <OrderContext.Provider value={{ order, addItemToOrder, removeItemFromOrder, reset, updateOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);