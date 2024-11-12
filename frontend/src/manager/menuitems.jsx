import { useEffect, useState } from 'react';

const MenuItems = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState(null);
  const [menuItemForm, setMenuItemForm] = useState({
    itemName: '',
    price: '',
  });

  const loadMenuItemsFromDatabase = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/menu-items/');
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMenuItemForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const openModal = (menuItem = null) => {
    setCurrentMenuItem(menuItem);
    setMenuItemForm(menuItem || { itemName: '', price: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentMenuItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = currentMenuItem ? 'PUT' : 'POST';
    const url = currentMenuItem
      ? `http://127.0.0.1:5000/api/menu-items/update`
      : 'http://127.0.0.1:5000/api/menu-items/create';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuItemForm),
      });
      if (!response.ok) {
        throw new Error('Failed to save menu item');
      }
      await loadMenuItemsFromDatabase();
      closeModal();
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  useEffect(() => {
    loadMenuItemsFromDatabase();
  }, []);

  return (
    <div className="flex flex-col items-center p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-red-600 mb-8">Menu Item Inventory</h1>
      <button
        onClick={() => openModal()}
        className="bg-green-600 text-white text-lg px-6 py-2 rounded shadow-lg hover:bg-green-500 transition duration-300 mb-4"
      >
        Add Item
      </button>
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg w-full max-w-4xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-16 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Menu Item</th>
              <th className="px-16 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Price</th>
              <th className="px-16 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {menuItems.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-16 py-4 text-center text-gray-500">No menu items found.</td>
              </tr>
            ) : (
              menuItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-100 transition duration-300">
                  <td className="px-16 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">{item.itemName}</td>
                  <td className="px-16 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">{item.price}</td>
                  <td className="px-16 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">
                    <button
                      onClick={() => openModal(item)}
                      className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-400 transition duration-300 mr-2"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* add/update popup */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">{currentMenuItem ? 'Edit Item' : 'Add Item'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Menu Item Name</label>
                <input
                  type="text"
                  name="itemName"
                  value={menuItemForm.itemName}
                  onChange={handleInputChange}
                  required
                  className="border rounded w-full p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Price</label>
                <input
                  type="number"
                  name="price"
                  value={menuItemForm.price}
                  onChange={handleInputChange}
                  required
                  className="border rounded w-full p-2"
                />
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={closeModal} className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-400 transition duration-300">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-400 transition duration-300">
                  {currentMenuItem ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItems;
