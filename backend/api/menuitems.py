"""
Menu Items Management API Module

This module provides REST API endpoints for managing menu items in the POS system.
Handles CRUD operations for menu items, including their ingredients, allergens,
and related properties.

Endpoints:
    - GET /api/menuitems/ : Get all active menu items with details
    - GET /api/menuitems/seasonal : Get seasonal menu items
    - GET /api/menuitems/allergens : Get allergens for a specific menu item
    - GET /api/menuitems/calories : Get calories for a specific menu item
    - GET /api/menuitems/recommendations : Get personalized menu recommendations
    - GET /api/menuitems/preference : Get menu items based on preferences
    - GET /api/menuitems/availableAllergens : Get list of all possible allergens
    - POST /api/menuitems/create : Create a new menu item
    - PUT /api/menuitems/update : Update an existing menu item
    - DELETE /api/menuitems/delete : Soft delete a menu item
"""

from flask import request, jsonify, Blueprint
from .database import get_db_connection
from psycopg2.extras import RealDictCursor
import psycopg2

menuitem_bp = Blueprint('menuitems', __name__, url_prefix='/api/menuitems')

@menuitem_bp.route('/seasonal', methods=['GET'])
def get_seasonal_menuitems():
    """
    Retrieves all seasonal menu items.

    Returns:
        tuple: JSON response with:
            - list of seasonal menu items
            - HTTP 200 on success
            - HTTP 500 on error
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM menu_items WHERE seasonal = 't'")
                ingredients = cur.fetchall()
        return jsonify(ingredients), 200
    except psycopg2.Error as e:
        print(f'Error getting seasonal items: {e}')
        return jsonify({"error": "could not get seasonal menu items"}), 500


@menuitem_bp.route('/allergens', methods=['GET'])
def get_menuitem_allergens():
    """
    Retrieves allergens for a specific menu item.

    Query Parameters:
        menu_item_name (str): Name of the menu item

    Returns:
        tuple: JSON response with:
            - list of allergen names
            - HTTP 200 on success
            - HTTP 400 if menu_item_name missing
            - HTTP 404 if no allergens found
            - HTTP 500 on error
    """
    menu_item_name = request.args.get('menu_item_name')

    if not menu_item_name:
        return jsonify({'error': 'menu_item_name parameter is required'}), 400

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                query = """
                    SELECT a.name AS allergen_name
                    FROM menu_items mi
                    JOIN menu_item_allergens mia ON mi.menu_item_id = mia.menu_item_id
                    JOIN allergens a ON mia.allergen_id = a.id
                    WHERE mi.menu_item_name = %s;
                """
                cur.execute(query, (menu_item_name,))
                allergens = cur.fetchall()

        if not allergens:
            return jsonify({'message': 'No allergens found for the menu item'}), 404
        
        # Return the list of allergen names
        return jsonify([allergen['allergen_name'] for allergen in allergens]), 200
    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500


@menuitem_bp.route('/calories', methods=['GET'])
def get_menuitem_calories():
    menu_item_name = request.args.get('menu_item_name')

    if not menu_item_name:
        return jsonify({'error': 'menu_item_name parameter is required'}), 400

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                query = """
                    SELECT mi.calories
                    FROM menu_items mi
                    WHERE mi.menu_item_name = %s;
                """
                cur.execute(query, (menu_item_name,))
                result = cur.fetchone()

        if result is None:
            return jsonify({'error': 'Menu item not found'}), 404
        
        return jsonify({'calories': result['calories']}), 200
    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500


@menuitem_bp.route('/create', methods=['POST'])
def create_menuitems():
    """
    Creates a new menu item with ingredients and allergens.

    Expected JSON payload:
        {
            "name": str,
            "category": str,
            "price": float,
            "calories": int,
            "ingredients": list[dict],  # Each dict has ingredient_id and amount
            "allergens": list[int],     # List of allergen IDs
            "flavor": str
        }

    Returns:
        tuple: JSON response with:
            - created menu_item_id
            - HTTP 200 on success
            - HTTP 500 on error
    """
    data = request.json
    name = data['name']
    category = data['category']
    price = data['price']
    calories = data['calories']
    ingredients = data['ingredients']
    allergens = data['allergens']  # list of allergen ids (1-8)
    flavor = data['flavor']

    print(f"Received data: {data}")

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "INSERT INTO menu_items (menu_item_name, category, price, calories, flavor) VALUES (%s, %s, %s, %s, %s) RETURNING menu_item_id;",
                    (name, category, price, calories, flavor)
                )
                row = cur.fetchone()
                menu_item_id = row['menu_item_id']
                print(f"Created menu item with ID: {menu_item_id}")

                for ingredient in ingredients:
                    ingredient_id = ingredient['ingredient_id']
                    amount = ingredient['amount']

                    cur.execute(
                        "INSERT INTO menu_items_ingredients (menu_item_id, ingredient_id, ingredient_amount) VALUES (%s, %s, %s);",
                        (menu_item_id, ingredient_id, amount)
                    )
                    print(f"Added ingredient with ID {ingredient_id} and amount {amount}")

                for allergen_id in allergens:
                    cur.execute(
                        "INSERT INTO menu_item_allergens (menu_item_id, allergen_id) VALUES (%s, %s);",
                        (menu_item_id, allergen_id)
                    )
                    print(f"Added allergen with ID {allergen_id}")

        return jsonify(menu_item_id), 200
    except psycopg2.Error as e:
        print(f"Error creating menu item: {e}")
        return jsonify({"error": "could not create menu item"}), 500


@menuitem_bp.route('/update', methods=['PUT'])
def update_menuitem():
    data = request.json
    name = data['name']
    category = data['category']
    price = data['price']
    calories = data['calories']
    ingredients = data['ingredients']
    allergens = data['allergens']
    flavor = data['flavor']
    menu_item_id = data['menu_item_id']
    
    print('allergens', allergens)

    if not name or not category or price is None or calories is None or menu_item_id is None:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    UPDATE menu_items 
                    SET menu_item_name = %s, category = %s, price = %s, calories = %s, flavor = %s 
                    WHERE menu_item_id = %s;
                    """,
                    (name, category, price, calories, flavor, menu_item_id)
                )

                cur.execute("DELETE FROM menu_items_ingredients WHERE menu_item_id = %s;", (menu_item_id,))
                for ingredient in ingredients:
                    ingredient_id = ingredient['ingredient_id']
                    amount = ingredient['amount']
                    cur.execute(
                        """
                        INSERT INTO menu_items_ingredients (menu_item_id, ingredient_id, ingredient_amount) 
                        VALUES (%s, %s, %s);
                        """,
                        (menu_item_id, ingredient_id, amount)
                    )

                cur.execute("DELETE FROM menu_item_allergens WHERE menu_item_id = %s;", (menu_item_id,))
                print(allergens)
                for allergen_id in allergens:
                    cur.execute(
                        """
                        INSERT INTO menu_item_allergens (menu_item_id, allergen_id) 
                        VALUES (%s, %s);
                        """,
                        (menu_item_id, allergen_id)
                    )

        return jsonify({"success": True}), 200
    except psycopg2.Error as e:
        print(f"Error updating menu item: {e}")
        return jsonify({"error": "could not update menu item"}), 500


@menuitem_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    customer_id = request.args.get("customerId")
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                string ="""SELECT m.*
                            FROM menu_items m
                            JOIN (
                                SELECT td.menu_item_id, SUM(td.item_quantity_sold) AS total_quantity
                                FROM transactions t
                                JOIN transaction_details td ON t.transaction_id = td.transaction_id
                                WHERE t.customer_id = %s
                                GROUP BY td.menu_item_id
                                ORDER BY total_quantity DESC
                                LIMIT 6
                            ) AS top_items ON m.menu_item_id = top_items.menu_item_id
                            ORDER BY top_items.total_quantity DESC;
                        """
                cur.execute(string, (customer_id,))
                recommended_items = cur.fetchall()
        return jsonify(recommended_items), 200
    except psycopg2.Error as e:
        print(f"Error getting the recommended menu items for user: {e}")
        return jsonify({"error": "could not get recommended menu items"}), 500

@menuitem_bp.route('/', methods=['GET'])
def get_menuitems():
    """
    Retrieves all active menu items with their complete details.
    Includes ingredients, allergens, and other properties.

    Returns:
        tuple: JSON response with:
            - list of menu items with full details
            - HTTP 200 on success
            - HTTP 500 on error

    Note:
        Inactive menu items are excluded from results
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                query = """
                    SELECT 
                        mi.menu_item_id,
                        mi.menu_item_name,
                        mi.category,
                        mi.price,
                        mi.calories,
                        mi.seasonal,
                        mi.active,
                        mi.flavor,
                        ARRAY_AGG(DISTINCT a.id) FILTER (WHERE a.id IS NOT NULL) AS allergen_ids,
                        ARRAY_AGG(DISTINCT a.name) FILTER (WHERE a.name IS NOT NULL) AS allergen_names,
                        JSON_AGG(DISTINCT jsonb_build_object('id', mi_ing.ingredient_id, 'amount', mi_ing.ingredient_amount)) 
                            FILTER (WHERE mi_ing.ingredient_id IS NOT NULL) AS ingredients
                    FROM menu_items mi
                    LEFT JOIN menu_item_allergens mia ON mi.menu_item_id = mia.menu_item_id
                    LEFT JOIN allergens a ON mia.allergen_id = a.id
                    LEFT JOIN menu_items_ingredients mi_ing ON mi.menu_item_id = mi_ing.menu_item_id
                    WHERE mi.active = 't'
                    GROUP BY mi.menu_item_id, mi.menu_item_name, mi.category, mi.price, mi.calories, mi.seasonal, mi.active, mi.flavor;
                """
                cur.execute(query)
                menu_items = cur.fetchall()
                
                for item in menu_items:
                    # Combine allergen IDs and names into a list of dictionaries
                    if item['allergen_ids'] and item['allergen_ids'][0] is not None:
                        item['allergens'] = [
                            {"id": allergen_id, "name": allergen_name}
                            for allergen_id, allergen_name in zip(item['allergen_ids'], item['allergen_names'])
                        ]
                    else:
                        item['allergens'] = []

                    # Remove the separate allergen_ids and allergen_names from the response
                    del item['allergen_ids']
                    del item['allergen_names']

                return jsonify(menu_items), 200
    except psycopg2.Error as e:
        print(f"Error getting menu items with details: {e}")
        return jsonify({"error": "could not get menu items with details"}), 500

@menuitem_bp.route('/delete', methods=['DELETE'])
def delete_menuitem():
    menu_item_id = request.args.get('menu_item_id')

    if not menu_item_id:
        return jsonify({'error': 'menu_item_id parameter is required'}), 400

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                print(f"Menu Item ID: {menu_item_id}")
 
                cur.execute("UPDATE menu_items SET active = FALSE WHERE menu_item_id = %s;", (menu_item_id,))

        return jsonify({'message': 'Menu item deleted successfully'}), 200
    except psycopg2.Error as e:
        print(f"Error deleting menu item: {e}")
        return jsonify({'error': 'could not delete menu item'}), 500

@menuitem_bp.route('/preference', methods=['GET'])
def get_preferences():
    chicken = request.args.get('chicken', type=str)
    flavors = request.args.getlist('flavors')
    allergens = request.args.getlist('allergens', type=tuple)
    calorie_min = request.args.get('calorie_min', default=0, type=int)
    calorie_max = request.args.get('calorie_max', default=1000, type=int)
    if not flavors:
        return jsonify([]), 200
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                string ="""SELECT * 
                            FROM menu_items 
                            WHERE 
                            (
                                CASE
                                    WHEN %s = 'true' THEN menu_item_name ILIKE '%%Chicken%%'
                                    WHEN %s = 'false' THEN menu_item_name NOT ILIKE '%%Chicken%%'
                                    ELSE TRUE
                                END
                            )
                            AND flavor IN %s
                            AND menu_item_id NOT IN (
                                SELECT DISTINCT menu_item_id
                                FROM menu_item_allergens
                                WHERE allergen_id = ANY(%s::integer[])
                            )
                            AND calories BETWEEN %s AND %s;
                        """
                cur.execute(string, (chicken, chicken, tuple(flavors), allergens, calorie_min, calorie_max))
                prefered = cur.fetchall()
        return jsonify(prefered), 200
    except psycopg2.Error as e:
        print(f"Error getting the preference driven recommended menu items: {e}")
        return jsonify({"error": "Error getting the preference driven recommended menu items"}), 500

@menuitem_bp.route('/availableAllergens', methods=['GET'])
def get_allergens():
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM allergens;")
                allergens = cur.fetchall()
        return jsonify(allergens), 200
    except psycopg2.Error as e:
        print(f"Error getting the list of allergens: {e}")
        return jsonify({"error": "Error getting the list of allergens"}), 500
