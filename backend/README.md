# Project 3 - Team XP Backend

## Overview

This project is the backend API for managing transactions, user authentication, and inventory in a restaurant setting. It includes endpoints for creating transactions, calculating prices, retrieving user points, managing employees, menu items, and generating reports.

## Features

- User authentication with Google OAuth
- Create and manage transactions
- Calculate the total price of an order
- Retrieve user points
- Manage employees and menu items
- Generate reports

## Technologies Used

- Flask
- PostgreSQL
- SQLAlchemy
- Authlib
- Flask-CORS
- dotenv

## Setup

1. Clone the repository.
2. Navigate to the backend directory.
3. Install the required dependencies using `pip install -r requirements.txt`.
4. Set up the PostgreSQL database and update the connection details in the `.env` file.
5. Run the Flask application using `flask run`.

## Environment Variables

Create a `.env` file in the backend directory and add the following environment variables:


SECRET_KEY=your_secret_key 
CLIENT_ID=your_google_client_id 
CLIENT_SECRET=your_google_client_secret 
DB_USER=your_database_user 
DB_PASSWORD=your_database_password 
DB_URL=your_database_url 
DB_NAME=your_database_name 
FRONTEND_URL=your_frontend_url



## Endpoints

### Authentication

- `GET /login`: Redirects the user to the Google OAuth login page.
- `GET /authorize`: Handles the OAuth callback from Google and retrieves user information.
- `GET /api/user`: Retrieves the logged-in user's information.
- `GET /logout`: Logs out the user by clearing the session.

### Transactions

- `POST /api/transactions/create`: Creates a new transaction.
- `POST /api/transactions/price`: Calculates the total price of an order.
- `GET /api/transactions/points`: Retrieves the current and total points for a user.

### Employees

- `GET /api/employees`: Retrieves a list of employees.
- `POST /api/employees`: Adds a new employee.
- `PUT /api/employees/<id>`: Updates an existing employee.
- `DELETE /api/employees/<id>`: Deletes an employee.

### Menu Items

- `GET /api/menuitems`: Retrieves a list of menu items.
- `POST /api/menuitems`: Adds a new menu item.
- `PUT /api/menuitems/<id>`: Updates an existing menu item.
- `DELETE /api/menuitems/<id>`: Deletes a menu item.

### Reports

- `GET /api/reports`: Generates and retrieves reports.

### Ingredients

- `GET /api/ingredients`: Retrieves a list of ingredients.
- `POST /api/ingredients`: Adds a new ingredient.
- `PUT /api/ingredients/<id>`: Updates an existing ingredient.
- `DELETE /api/ingredients/<id>`: Deletes an ingredient.

## License

This project is licensed under the MIT License.