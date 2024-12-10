from flask import Flask, request, jsonify, Blueprint
import psycopg2
from psycopg2.extras import RealDictCursor
from .database import get_db_connection

ingredients_bp = Blueprint("ingredients", __name__, url_prefix="/api/ingredients")


@ingredients_bp.route("/", methods=["GET"])
def get_ingredients():
    """
    Fetches all ingredients from the database and returns them as JSON.
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM ingredients;")
                ingredients = cur.fetchall()
        return jsonify(ingredients), 200
    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 500


@ingredients_bp.route("/create", methods=["POST"])
def create_ingredient():
    """
    Creates a new ingredient with provided details (JSON).

    Input JSON:
        - name (String)
        - stock (Integer)
    """
    
    data = request.json
    name = data["name"]
    stock = data["stock"]

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                query = """
                    INSERT INTO ingredients (ingredient_name, stock)
                    VALUES (%s, %s) RETURNING ingredient_id;
                """
                cur.execute(query, (name, stock))
                ingredient_id = cur.fetchone()[0]
        return (
            jsonify({"message": "Ingredient created", "ingredient_id": ingredient_id}),
            201,
        )
    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 500


@ingredients_bp.route("/update-stock", methods=["PUT"])
def update_ingredient_stock():
    """
    Updates the stock of an ingredient based on its name.

    Input JSON:
        - name (String)
        - stock (Integer)
    """
    
    data = request.json
    name = data["name"]
    stock = data["stock"]

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                query = "UPDATE ingredients SET stock = %s WHERE ingredient_name = %s;"
                cur.execute(query, (stock, name))
        return jsonify({"message": "Ingredient stock updated successfully"}), 200
    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 500
