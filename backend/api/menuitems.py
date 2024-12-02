from flask import request, jsonify, Blueprint
from .database import get_db_connection
from psycopg2.extras import RealDictCursor
import psycopg2

menuitem_bp = Blueprint('menuitems', __name__, url_prefix='/api/menuitems')

@menuitem_bp.route('/', methods=['GET'])
def get_menuitems():
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    SELECT mi.menu_item_id, mi.menu_item_name, mi.category, mi.price, mi.calories, mi.seasonal,
                           JSON_AGG(DISTINCT i.ingredient_name) AS ingredients,
                           JSON_AGG(DISTINCT a.name) AS allergens
                    FROM menu_items mi
                    LEFT JOIN menu_items_ingredients mii ON mi.menu_item_id = mii.menu_item_id
                    LEFT JOIN ingredients i ON mii.ingredient_id = i.ingredient_id
                    LEFT JOIN menu_item_allergens mia ON mi.menu_item_id = mia.menu_item_id
                    LEFT JOIN allergens a ON mia.allergen_id = a.id
                    GROUP BY mi.menu_item_id;
                    """
                )
                menu_items = cur.fetchall()
        return jsonify(menu_items), 200
    except psycopg2.Error as e:
        print(f"Error getting all menu items: {e}")
        return jsonify({"error": "could not get menu items"}), 500

@menuitem_bp.route('/ingredients', methods=['GET'])
def get_ingredients():
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT ingredient_id, ingredient_name FROM ingredients;")
                ingredients = cur.fetchall()
        return jsonify(ingredients), 200
    except psycopg2.Error as e:
        print(f"Error getting ingredients: {e}")
        return jsonify({"error": "could not get ingredients"}), 500

@menuitem_bp.route('/allergens', methods=['GET'])
def get_allergens():
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT id AS allergen_id, name AS allergen_name FROM allergens;")
                allergens = cur.fetchall()
        return jsonify(allergens), 200
    except psycopg2.Error as e:
        print(f"Error getting allergens: {e}")
        return jsonify({"error": "could not get allergens"}), 500

@menuitem_bp.route('/create', methods=['POST'])
def create_menuitems():
    data = request.json
    name = data.get('name')
    category = data.get('category')
    price = data.get('price')
    calories = data.get('calories')
    ingredients = data.get('ingredients', {})
    allergens = data.get('allergens', {})

    if not name or not category or price is None or calories is None:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    INSERT INTO menu_items (menu_item_name, category, price, calories) 
                    VALUES (%s, %s, %s, %s) 
                    RETURNING menu_item_id;
                    """,
                    (name, category, price, calories)
                )
                menu_item_id = cur.fetchone()['menu_item_id']

                for ingredient_id, included in ingredients.items():
                    if included:
                        cur.execute(
                            """
                            INSERT INTO menu_items_ingredients (menu_item_id, ingredient_id, ingredient_amount) 
                            VALUES (%s, %s, %s);
                            """,
                            (menu_item_id, ingredient_id, 1)
                        )

                for allergen_id, included in allergens.items():
                    if included:
                        cur.execute(
                            """
                            INSERT INTO menu_item_allergens (menu_item_id, allergen_id) 
                            VALUES (%s, %s);
                            """,
                            (menu_item_id, allergen_id)
                        )

        return jsonify({"menu_item_id": menu_item_id}), 200
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
        return jsonify({"error": "could not update menu item"}), 500
