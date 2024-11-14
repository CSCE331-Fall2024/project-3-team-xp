import { useEffect, useState } from 'react';

const MenuItems = () => {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [menuitems, setMenuItems] = useState([]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState(null);
  const [menuItemForm, setMenuItemForm] = useState({
    name: '',
    category: '',
    price: '',
    ingredients: {},
    seasonal: false,
  });

  const loadMenuItemsFromDatabase = async () => {
    try {
      const response = await fetch(`${VITE_BACKEND_URL}/api/menuitems`);
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const loadIngredientsFromDatabase = async () => {
    try {
      const response = await fetch(`${VITE_BACKEND_URL}/api/ingredients`);
      if (!response.ok) {
        throw new Error('Failed to fetch ingredients');
      }
      const data = await response.json();
      setIngredientsList(data);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  const loadMenuItemIngredients = async (menuItemId) => {
    try {
      const response = await fetch(`${VITE_BACKEND_URL}/api/menuitems/${menuItemId}/ingredients`);
      if (!response.ok) {
        throw new Error('Failed to fetch menu item ingredients');
      }
      const data = await response.json();
      const ingredients = data.reduce((acc, item) => {
        acc[item.ingredient_id] = true;
        return acc;
      }, {});
      setMenuItemForm((prevForm) => ({ ...prevForm, ingredients }));
    } catch (error) {
      console.error('Error loading menu item ingredients:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMenuItemForm((prevForm) => ({
      ...prevForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleIngredientCheckboxChange = (ingredientId) => {
    setMenuItemForm((prevForm) => ({
      ...prevForm,
      ingredients: {
        ...prevForm.ingredients,
        [ingredientId]: !prevForm.ingredients[ingredientId],
      },
    }));
  };

  const openModal = (menuItem = null) => {
    setCurrentMenuItem(menuItem);
    setMenuItemForm(
      menuItem
        ? { name: menuItem.menu_item_name, category: menuItem.category, price: menuItem.price, ingredients: {}, seasonal: menuItem.seasonal }
        : { name: '', category: '', price: '', ingredients: {}, seasonal: false }
    );
    setIsModalOpen(true);

    if (menuItem) {
      loadMenuItemIngredients(menuItem.menu_item_id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentMenuItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = currentMenuItem ? 'PUT' : 'POST';
    const url = currentMenuItem
      ? `${VITE_BACKEND_URL}/api/menuitems/update`
      : `${VITE_BACKEND_URL}/api/menuitems/create`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...menuItemForm,
          ingredients: undefined, // Do not include ingredients directly in menu item data
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to save menu item');
      }

      if (currentMenuItem) {
        await updateMenuItemIngredients(currentMenuItem.menu_item_id, menuItemForm.ingredients);
      }

      await loadMenuItemsFromDatabase();
      closeModal();
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  const updateMenuItemIngredients = async (menuItemId, ingredients) => {
    try {
      await fetch(`${VITE_BACKEND_URL}/api/menuitems/${menuItemId}/ingredients`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      });
    } catch (error) {
      console.error('Error updating menu item ingredients:', error);
    }
  };

  useEffect(() => {
    loadMenuItemsFromDatabase();
    loadIngredientsFromDatabase();
  }, []);

  return (
    <div className="flex flex-col items-center p-8 bg-gray-50">
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
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Menu Item</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Seasonal</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {menuitems.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No menu items found.</td>
              </tr>
            ) : (
              menuitems.map((item) => (
                <tr key={item.menu_item_id} className="hover:bg-gray-100 transition duration-300">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">{item.menu_item_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">{item.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">{item.seasonal ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">
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

      {/* Modal for adding/editing items */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">{currentMenuItem ? 'Edit Item' : 'Add Item'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Menu Item Name</label>
                <input
                  type="text"
                  name="name"
                  value={menuItemForm.name}
                  onChange={handleInputChange}
                  required
                  className="border rounded w-full p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Category</label>
                <select
                  name="category"
                  value={menuItemForm.category}
                  onChange={handleInputChange}
                  required
                  className="border rounded w-full p-2"
                >
                  <option value="" disabled>Select Category</option>
                  <option value="Entree">Entree</option>
                  <option value="Side">Side</option>
                  <option value="Drink">Drink</option>
                </select>
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
              <div className="mb-4">
                <label className="block text-gray-700">Ingredients</label>
                <div className="overflow-y-auto h-32 border rounded p-3">
                  {ingredientsList.map((ingredient) => (
                    <label key={ingredient.ingredient_id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={menuItemForm.ingredients[ingredient.ingredient_id] || false}
                        onChange={() => handleIngredientCheckboxChange(ingredient.ingredient_id)}
                      />
                      <span className="ml-2">{ingredient.ingredient_name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Seasonal</label>
                <input
                  type="checkbox"
                  name="seasonal"
                  checked={menuItemForm.seasonal}
                  onChange={handleInputChange}
                  className="border rounded"
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
