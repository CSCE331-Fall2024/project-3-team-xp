from flask import request, jsonify, Blueprint
from .database import get_db_connection
from psycopg2.extras import RealDictCursor
import psycopg2

menuitem_bp = Blueprint('menuitems', __name__, url_prefix='/api/menuitems')

@menuitem_bp.route('/seasonal', methods=['GET'])
def get_seasonal_menuitems():
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT ingredient_id, ingredient_name FROM ingredients;")
                ingredients = cur.fetchall()
        return jsonify(ingredients), 200
    except psycopg2.Error as e:
        print(f'Error getting seasonal items: {e}')
        return jsonify({"error": "could not get seasonal menu items"}), 500
    

@menuitem_bp.route('/allergens', methods=['GET'])
def get_menuitem_allergens():
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
    menu_item_name = request.args.get('menu_item_name')  # Get menu_item_name from query parameter

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
                    cur.execute("SELECT ingredient_id FROM ingredients WHERE ingredient_name = %s;", (ingredient,))
                    row = cur.fetchone()
                    if row:
                        ingredient_id = row['ingredient_id']
                        cur.execute("SELECT stock FROM ingredients WHERE ingredient_id = %s", (ingredient_id,))
                        row = cur.fetchone()
                        stock = row['stock']
                        cur.execute(
                            "INSERT INTO menu_items_ingredients (menu_item_id, ingredient_id, ingredient_amount) VALUES (%s, %s, %s);",
                            (menu_item_id, ingredient_id, stock)
                        )
                        print(f"Added ingredient {ingredient} with ID {ingredient_id} and stock {stock}")
                    else:
                        print(f"Ingredient {ingredient} not found")

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
    name = data.get('name')
    category = data.get('category')
    price = data.get('price')
    calories = data.get('calories')
    menu_item_id = data.get('menu_item_id')
    ingredients = data.get('ingredients', {})
    allergens = data.get('allergens', {})

    if not name or not category or price is None or calories is None:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    UPDATE menu_items 
                    SET category = %s, price = %s, calories = %s 
                    WHERE menu_item_id = %s;
                    """,
                    (category, price, calories, menu_item_id)
                )

                cur.execute("DELETE FROM menu_items_ingredients WHERE menu_item_id = %s;", (menu_item_id,))
                for ingredient_id, included in ingredients.items():
                    if included:
                        cur.execute(
                            """
                            INSERT INTO menu_items_ingredients (menu_item_id, ingredient_id, ingredient_amount) 
                            VALUES (%s, %s, %s);
                            """,
                            (menu_item_id, ingredient_id, 1)
                        )

                cur.execute("DELETE FROM menu_item_allergens WHERE menu_item_id = %s;", (menu_item_id,))
                for allergen_id, included in allergens.items():
                    if included:
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
        return jsonify({"error": "could not create menu item"}), 500


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
                                LIMIT 5
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
                        ARRAY_AGG(DISTINCT a.name) FILTER (WHERE a.name IS NOT NULL) as allergens
                    FROM menu_items mi
                    LEFT JOIN menu_item_allergens mia ON mi.menu_item_id = mia.menu_item_id
                    LEFT JOIN allergens a ON mia.allergen_id = a.id
                    GROUP BY mi.menu_item_id, mi.menu_item_name, mi.category, mi.price, mi.calories, mi.seasonal;
                """
                cur.execute(query)
                menu_items = cur.fetchall()
                
                # Process the results to format allergens properly
                for item in menu_items:
                    item['has_allergens'] = bool(item['allergens'] and item['allergens'][0] is not None)
                    if not item['has_allergens']:
                        item['allergens'] = []

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





