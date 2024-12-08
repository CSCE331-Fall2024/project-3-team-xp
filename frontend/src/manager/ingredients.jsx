import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Ingredients Manager Component
 *
 * Manages the ingredients inventory, allowing users to view, add, and edit ingredients, changing the backend.
 *
 * @returns {JSX.Element} The rendered Ingredients component.
 */
const Ingredients = () => {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [ingredients, setIngredients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState(null);
  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    stock: '',
  });
  
  const navigate = useNavigate();

  /**
   * Fetches all ingredients from the backend and updates the state.
   *
   * @async
   * @function loadIngredientsFromDatabase
   */
  const loadIngredientsFromDatabase = async () => {
    try {
      const response = await fetch(`${VITE_BACKEND_URL}/api/ingredients/`);
      if (!response.ok) {
        throw new Error('Failed to fetch ingredients');
      }
      const data = await response.json();
      setIngredients(data);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  /**
   * Handles input changes in the ingredient form.
   *
   * @param {Object} e - The event object from the input field.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIngredientForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  /**
   * Opens the Add/Edit modal with specified ingredient data or as a blank form.
   *
   * @param {Object|null} ingredient - The ingredient to edit, or null for a new ingredient.
   */
  const openModal = (ingredient = null) => {
    setCurrentIngredient(ingredient);
    setIngredientForm(
      ingredient || { name: '', stock: '' }
    );
    setIsModalOpen(true);
  };

  /**
   * Closes the Add/Edit modal and resets the form.
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentIngredient(null);
    setIngredientForm({ name: '', stock: '' });
  };

  /**
   * Submits the form to add or update an ingredient.
   *
   * @async
   * @param {Object} e - The form submit event object.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = currentIngredient ? 'PUT' : 'POST';
    const url = currentIngredient
      ? `${VITE_BACKEND_URL}/api/ingredients/update-stock`
      : `${VITE_BACKEND_URL}/api/ingredients/create`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ingredientForm), // Send form data as JSON
      });
      if (!response.ok) {
        throw new Error('Failed to save ingredient');
      }
      await loadIngredientsFromDatabase(); // Refresh the ingredients list
      closeModal(); // Close the modal
    } catch (error) {
      console.error('Error saving ingredient:', error);
    }
  };

  /**
   * Fetches the ingredients when the component is mounted.
   *
   * @useEffect
   */
  useEffect(() => {
    loadIngredientsFromDatabase();
  }, []);

  return (
    <div className="flex flex-col items-center p-8 bg-gray-50 dark:bg-slate-800">
      <button
            className="fixed top-20 left-4 bg-gray-300 text-black font-bold text-2xl rounded-full w-12 h-12 flex items-center justify-center bg-opacity-75 hover:scale-110 hover:bg-gray-400 transition-transform duration-200 ease-in-out"
            onClick={() => navigate(-1)}
            >
            {"<"}
      </button>
      <h1 className="text-4xl font-bold text-red-600 mb-8">Ingredients Inventory</h1>
      <button
        onClick={() => openModal()}
        className="bg-green-600 text-white text-lg px-6 py-2 rounded shadow-lg hover:bg-green-500 transition duration-300 mb-4"
      >
        Add Ingredient
      </button>
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg w-full max-w-4xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-16 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Ingredient
              </th>
              <th className="px-16 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-16 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:bg-slate-300 divide-gray-200">
            {ingredients.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-16 py-4 text-center text-gray-500">
                  No ingredients found.
                </td>
              </tr>
            ) : (
              ingredients.map((ingredient) => (
                <tr
                  key={ingredient.ingredient_id} // Match the backend's "ingredient_id"
                  className="hover:bg-gray-100 transition duration-300"
                >
                  <td className="px-16 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                    {ingredient.ingredient_name}
                  </td>
                  <td className="px-16 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">
                    {ingredient.stock}
                  </td>
                  <td className="px-16 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">
                    <button
                      onClick={() =>
                        openModal({
                          name: ingredient.ingredient_name, // Set form data correctly
                          stock: ingredient.stock,
                        })
                      }
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
          <div className="bg-white dark:bg-black p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl dark:text-white font-bold mb-4">
              {currentIngredient ? 'Edit Ingredient' : 'Add Ingredient'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-white">Ingredient Name</label>
                <input
                  type="text"
                  name="name" // Match backend's "name" field
                  value={ingredientForm.name}
                  onChange={handleInputChange}
                  required
                  className="border rounded w-full p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-white">Stock</label>
                <input
                  type="number"
                  name="stock" // Match backend's "stock" field
                  value={ingredientForm.stock}
                  onChange={handleInputChange}
                  required
                  className="border rounded w-full p-2"
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
                  {currentIngredient ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ingredients;