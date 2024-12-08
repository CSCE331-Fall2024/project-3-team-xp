import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Employees Manager Component
 *
 * Provides a user interface for managing employees. Users can view, add, edit,
 * and delete employees through a dynamic interface. The component interacts
 * with a backend API for CRUD operations.
 *
 * @returns {JSX.Element} The rendered Employees component.
 */
const Employees = () => {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    employee_name: '',
    position: '',
    hire_date: '',
  });

  const navigate = useNavigate();

  /**
   * Fetches employees from the backend and updates the state.
   * Sorts employees by hire date before setting the state.
   *
   * @async
   * @function loadEmployeesFromDatabase
   */
  const loadEmployeesFromDatabase = async () => {
    try {
      const response = await fetch(`${VITE_BACKEND_URL}/api/employees/`);
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data.sort((a, b) => new Date(a.hire_date) - new Date(b.hire_date)));
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  /**
   * Handles input changes in the employee form.
   *
   * @param {Object} e - The event object from the input field.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  /**
   * Opens the Add/Edit modal and initializes form data.
   *
   * @param {Object|null} employee - The employee to edit, or null for adding a new employee.
   */
  const openModal = (employee = null) => {
    setCurrentEmployee(employee);
    setEmployeeForm(employee || { employee_name: '', position: '', hire_date: '' });
    setIsModalOpen(true);
  };

  /**
   * Closes the Add/Edit modal and resets relevant state.
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEmployee(null);
  };

  /**
   * Opens the delete confirmation modal for a specific employee.
   *
   * @param {Object} employee - The employee to delete.
   */
  const openDeleteConfirm = (employee) => {
    setCurrentEmployee(employee);
    setIsDeleteConfirmOpen(true);
  };

  /**
   * Closes the delete confirmation modal and resets relevant state.
   */
  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
    setCurrentEmployee(null);
  };

  /**
   * Handels the submit button click to create or update an employee.
   *
   * @async
   * @param {Object} e - The event object from the form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = currentEmployee ? 'PUT' : 'POST';
    const url = currentEmployee
      ? `${VITE_BACKEND_URL}/api/employees/update-role`
      : `${VITE_BACKEND_URL}/api/employees/create`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeForm),
      });
      if (!response.ok) {
        throw new Error('Failed to save employee');
      }
      await loadEmployeesFromDatabase();
      closeModal();
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  /**
   * Deletes the currently selected employee.
   *
   * @async
   * @function handleDelete
   */
  const handleDelete = async () => {
    try {
      const response = await fetch(`${VITE_BACKEND_URL}/api/employees/delete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: currentEmployee.employee_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }
      await loadEmployeesFromDatabase();
      closeDeleteConfirm();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  /**
   * Fetches employees when the component is mounted.
   *
   * @useEffect
   */
  useEffect(() => {
    loadEmployeesFromDatabase();
  }, []);

  return (
    <div className="flex flex-col items-center p-8 bg-gray-50 dark:dark:bg-slate-800 min-h-screen">
      <button
            className="fixed top-20 left-4 bg-gray-300 text-black font-bold text-2xl rounded-full w-12 h-12 flex items-center justify-center bg-opacity-75 hover:scale-110 hover:bg-gray-400 transition-transform duration-200 ease-in-out"
            onClick={() => navigate(-1)}
            >
            {"<"}
      </button>
      <h1 className="text-4xl font-bold text-red-600 mb-8">Employees</h1>
      <button
        onClick={() => openModal()}
        className="bg-green-600 text-white text-lg px-6 py-2 rounded shadow-lg hover:bg-green-500 transition duration-300 mb-4"
      >
        Add Employee
      </button>
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg w-full max-w-4xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-16 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Employee Name</th>
              <th className="px-16 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Position</th>
              <th className="px-16 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Hire Date</th>
              <th className="px-16 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-300 divide-y divide-gray-200">
            {employees.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-16 py-4 text-center text-gray-500">No employees found.</td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.employee_id} className="hover:bg-gray-100 transition duration-300">
                  <td className="px-16 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">{employee.employee_name}</td>
                  <td className="px-16 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">{employee.position}</td>
                  <td className="px-16 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">
                    {new Date(employee.hire_date).toLocaleDateString()}
                  </td>
                  <td className="px-16 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">
                    <button
                      onClick={() => openModal(employee)}
                      className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-400 transition duration-300 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(employee)}
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-400 transition duration-300"
                    >
                      Delete
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
            <h2 className="text-xl font-bold mb-4">{currentEmployee ? 'Edit Employee' : 'Add Employee'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Employee Name</label>
                <input
                  type="text"
                  name="employee_name"
                  value={employeeForm.employee_name}
                  onChange={handleInputChange}
                  required
                  className="border rounded w-full p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Position</label>
                <select
                  name="position"
                  value={employeeForm.position}
                  onChange={handleInputChange}
                  required
                  className="border rounded w-full p-2"
                >
                  <option value="" disabled>Select Position</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={closeModal} className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-400 transition duration-300">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-400 transition duration-300">
                  {currentEmployee ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete {currentEmployee?.employee_name}?</p>
            <div className="flex justify-between mt-4">
              <button type="button" onClick={closeDeleteConfirm} className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-400 transition duration-300">
                Cancel
              </button>
              <button onClick={handleDelete} className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-400 transition duration-300">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;