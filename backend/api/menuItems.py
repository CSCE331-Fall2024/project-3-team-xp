from flask import request, jsonify, Blueprint
from .database import get_db_connection
import psycopg2

menuitem_bp = Blueprint('menuitems', __name__, url_prefix='/api/menuitems')

@menuitem_bp.route('/menuitems', methods=['GET'])
def get_menuitems():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM menu_items;")
                menu_items = cur.fetchall()
        return jsonify(menu_items), 200
    except psycopg2.Error as e:
        print(f"Error getting all menu items: {e}")
        return jsonify({"error": "could not get menu items"}), 500
    

