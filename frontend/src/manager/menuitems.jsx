import { useEffect, useState } from 'react';

const MenuItems = () => {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [menuitems, setMenuItems] = useState([]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [allergenList, setAllergenList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState(null);
  const [menuItemForm, setMenuItemForm] = useState({
    name: '',
    category: '',
    price: '',
    calories: '',
    ingredients: {},
    allergens: {},
    seasonal: false,
  });

  const [errorMessage, setErrorMessage] = useState('');

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

  const loadAllergenListFromDatabase = async () => {
    try {
      const response = await fetch(`${VITE_BACKEND_URL}/api/allergens`);
      if (!response.ok) {
        throw new Error('Failed to fetch allergens');
      }
      const data = await response.json();
      setAllergenList(data);
    } catch (error) {
      console.error('Error loading allergens:', error);
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

  const handleAllergenCheckboxChange = (allergenId) => {
    setMenuItemForm((prevForm) => ({
      ...prevForm,
      allergens: {
        ...prevForm.allergens,
        [allergenId]: !prevForm.allergens[allergenId],
      },
    }));
  };

  const openModal = (menuItem = null) => {
    setCurrentMenuItem(menuItem);
    setMenuItemForm(
      menuItem
        ? {
            name: menuItem.menu_item_name,
            category: menuItem.category,
            price: menuItem.price,
            calories: menuItem.calories,
            ingredients: menuItem.ingredients || {},
            allergens: menuItem.allergens || {},
            seasonal: menuItem.seasonal,
          }
        : { name: '', category: '', price: '', calories: '', ingredients: {}, allergens: {}, seasonal: false }
    );
    setErrorMessage('');
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
      ? `${VITE_BACKEND_URL}/api/menuitems/update`
      : `${VITE_BACKEND_URL}/api/menuitems/create`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: menuItemForm.name,
          category: menuItemForm.category,
          price: parseFloat(menuItemForm.price),
          calories: parseFloat(menuItemForm.calories),
          ingredients: menuItemForm.ingredients,
          allergens: menuItemForm.allergens,
          seasonal: menuItemForm.seasonal,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save menu item');
      }

      await loadMenuItemsFromDatabase();
      closeModal();
    } catch (error) {
      console.error('Error saving menu item:', error);
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    loadMenuItemsFromDatabase();
    loadIngredientsFromDatabase();
    loadAllergenListFromDatabase();
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
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Menu Item
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Calories
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Seasonal
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {menuitems.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No menu items found.
                </td>
              </tr>
            ) : (
              menuitems.map((item) => (
                <tr
                  key={item.menu_item_id}
                  className="hover:bg-gray-100 transition duration-300"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                    {item.menu_item_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">
                    {item.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">
                    {item.calories}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">
                    {item.seasonal ? 'Yes' : 'No'}
                  </td>
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

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">
              {currentMenuItem ? 'Edit Item' : 'Add Item'}
            </h2>
            {errorMessage && (
              <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
            )}
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
                  <option value="" disabled>
                    Select Category
                  </option>
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
                <label className="block text-gray-700">Calories</label>
                <input
                  type="number"
                  name="calories"
                  value={menuItemForm.calories}
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
                <label className="block text-gray-700">Allergens</label>
                <div className="overflow-y-auto h-32 border rounded p-3">
                  {allergenList.map((allergen) => (
                    <label key={allergen.allergen_id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={menuItemForm.allergens[allergen.allergen_id] || false}
                        onChange={() => handleAllergenCheckboxChange(allergen.allergen_id)}
                      />
                      <span className="ml-2">{allergen.allergen_name}</span>
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
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-400 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-400 transition duration-300"
                >
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
