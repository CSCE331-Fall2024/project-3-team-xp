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
                menu_item_id = cur.fetchone()
                for ingredient in ingredients:
                    ingredient_id = cur.execute("SELECT ingredient_id FROM ingredients WHERE ingredient_name = %s", ingredient)
                    stock = cur.execute("SELECT stock WHERE ingredient_id = %s", (ingredient_id))
                    cur.execute("INSERT INTO menu_items_ingredients (menu_item_id, ingredient_id, ingredient_amount) VALUES (%s, %s, %s);", (menu_item_id, ingredient_id, stock))
        return jsonify(menu_item_id), 200
    except psycopg2.Error as e:
        print(f"Error creating menu item: {e}")
        return jsonify({"error": "could not create menu item"}), 500