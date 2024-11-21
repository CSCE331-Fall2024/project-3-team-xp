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
                cur.execute("SELECT * FROM menu_items;")
                menu_items = cur.fetchall()
        return jsonify(menu_items), 200
    except psycopg2.Error as e:
        print(f"Error getting all menu items: {e}")
        return jsonify({"error": "could not get menu items"}), 500
    
@menuitem_bp.route('/seasonal', methods=['GET'])
def get_seasonal_menuitems():
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM menu_items WHERE seasonal = 't';")
                menu_items = cur.fetchall()
            return jsonify(menu_items), 200
    except psycopg2.Error as e:
        print(f'Error getting seasonal items: {e}')
        return jsonify({"error": "could not get seasonal menu items"}), 500
    

@menuitem_bp.route('/allergens', methods=['GET'])
def get_allergens_for_menuitem():
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



@menuitem_bp.route('/create', methods=['POST'])
def create_menuitems():
    data = request.json
    name = data['name']
    category = data['category']
    price = data['price']
    ingredients = data['ingredients'] #list

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("INSERT INTO menu_items (menu_item_name, category, price) VALUES (%s, %s, %s) RETURNING menu_item_id;", (name, category, price))
                row = cur.fetchone()
                menu_item_id = row['menu_item_id']
                for ingredient in ingredients:
                    cur.execute("SELECT ingredient_id FROM ingredients WHERE ingredient_name = %s;", (ingredient,))
                    row = cur.fetchone()
                    ingredient_id = row['ingredient_id']
                    print(ingredient_id, ingredient)
                    cur.execute("SELECT stock FROM ingredients WHERE ingredient_id = %s", (ingredient_id,))
                    row = cur.fetchone()
                    stock = row['stock']
                    cur.execute("INSERT INTO menu_items_ingredients (menu_item_id, ingredient_id, ingredient_amount) VALUES (%s, %s, %s);", (menu_item_id, ingredient_id, stock,))
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

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("UPDATE menu_items SET category = %s, price = %s WHERE menu_item_name = %s;", (category, price, name))
        return jsonify(True), 200 
    except psycopg2.Error as e:
        print(f"Error updating menu item: {e}")
        return jsonify({"error": "could not create menu item"}), 500
    












