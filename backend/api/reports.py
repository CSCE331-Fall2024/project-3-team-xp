"""
Reports API Module

This module provides REST API endpoints for generating various business reports.
It handles product usage tracking, sales analysis, and performance metrics.

Endpoints:
    - GET /api/reports/productUsage : Get ingredient usage statistics
    - GET /api/reports/salesByHour : Get hourly sales breakdown
    - GET /api/reports/salesByEmployee : Get employee sales performance
    - GET /api/reports/salesReport : Get detailed sales report
    - GET /api/reports/popularityAnalysis : Get menu item popularity metrics
"""

from flask import Flask, request, jsonify, Blueprint
import psycopg2
from psycopg2.extras import RealDictCursor
from .database import get_db_connection

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")


@reports_bp.route("/productUsage", methods=["GET"])
def get_product_usage():
    """
    Fetches total ingredient usage within a specified time range.

    Query Parameters:
        start_date (str): Start of the date range (ISO format)
        end_date (str): End of the date range (ISO format)

    Returns:
        tuple: JSON response with:
            - dict of ingredient names and their total usage
            - HTTP 200 on success
            - HTTP 500 on database errors

    Example Response:
        {
            "Rice": 150.5,
            "Chicken": 75.2,
            ...
        }
    """
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    print(f"Received request: start_date={start_date}, end_date={end_date}")

    product_usage_data = {}

    try:
        print("Start of try")
        with get_db_connection() as conn:
            print("Passed Connection")
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                query = """
                    SELECT 
                        i.ingredient_name, 
                        SUM(mi.ingredient_amount * td.item_quantity_sold) AS total_inventory_used
                    FROM 
                        transaction_details td
                    JOIN 
                        menu_items m ON td.menu_item_id = m.menu_item_id
                    JOIN 
                        menu_items_ingredients mi ON m.menu_item_id = mi.menu_item_id
                    JOIN 
                        ingredients i ON mi.ingredient_id = i.ingredient_id
                    JOIN 
                        transactions t ON td.transaction_id = t.transaction_id
                    WHERE 
                        t.order_timestamp BETWEEN %s AND %s
                    GROUP BY 
                        i.ingredient_name
                    ORDER BY 
                        total_inventory_used DESC;
                """
                cur.execute(query, (start_date, end_date))
                results = cur.fetchall()

                product_usage_data = {
                    row["ingredient_name"]: row["total_inventory_used"]
                    for row in results
                }
            print("Emd queery")

        return jsonify(product_usage_data), 200
    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 500


@reports_bp.route("/salesByHour", methods=["GET"])
def get_current_sales_by_hour():
    """
    Fetches hourly sales totals for the current day.

    Returns:
        tuple: JSON response with:
            - dict of hours and their sales totals
            - HTTP 200 on success
            - HTTP 500 on database errors

    Example Response:
        {
            "2023-11-15T09:00:00": 523.50,
            "2023-11-15T10:00:00": 789.25,
            ...
        }
    """
    sales_by_hour_data = {}

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                query = """
                    SELECT 
                        DATE_TRUNC('hour', t.order_timestamp) AS hour, 
                        SUM(td.item_quantity_sold * mi.price) AS total_sales
                    FROM 
                        transactions t
                    JOIN 
                        transaction_details td ON t.transaction_id = td.transaction_id
                    JOIN 
                        menu_items mi ON td.menu_item_id = mi.menu_item_id
                    WHERE 
                        t.order_timestamp::DATE = CURRENT_DATE 
                        AND t.order_timestamp <= NOW()
                    GROUP BY 
                        hour
                    ORDER BY 
                        hour;
                """
                cur.execute(query)
                results = cur.fetchall()

                sales_by_hour_data = {
                    row["hour"]: row["total_sales"] for row in results
                }

        return jsonify(sales_by_hour_data), 200
    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 500


@reports_bp.route("/salesByEmployee", methods=["GET"])
def get_total_sales_by_employee():
    """
    Fetches total sales per employee for the current day.

    Returns:
        tuple: JSON response with:
            - dict of employee names and their total sales
            - HTTP 200 on success
            - HTTP 500 on database errors

    Example Response:
        {
            "John Smith": 1234.56,
            "Jane Doe": 2345.67,
            ...
        }
    """
    total_sales_by_employee = {}

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                query = """
                    SELECT 
                        e.employee_name, 
                        SUM(td.item_quantity_sold * mi.price) AS total_sales
                    FROM 
                        transactions t
                    JOIN 
                        transaction_details td ON t.transaction_id = td.transaction_id
                    JOIN 
                        menu_items mi ON td.menu_item_id = mi.menu_item_id
                    JOIN 
                        employees e ON t.employee_id = e.employee_id
                    WHERE 
                        t.order_timestamp::DATE = CURRENT_DATE
                    GROUP BY 
                        e.employee_name
                    ORDER BY 
                        total_sales DESC;
                """
                cur.execute(query)
                results = cur.fetchall()

                total_sales_by_employee = {
                    row["employee_name"]: row["total_sales"] for row in results
                }

        return jsonify(total_sales_by_employee), 200
    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 500


@reports_bp.route("/salesReport", methods=["GET"])
def get_sales_report():
    """
    Generates a comprehensive sales report for a date range.

    Query Parameters:
        start_date (str): Start of the date range (ISO format)
        end_date (str): End of the date range (ISO format)

    Returns:
        tuple: JSON response with:
            - list of sales records with menu item details
            - HTTP 200 on success
            - HTTP 500 on database errors

    Example Response:
        [
            {
                "menu_item_name": "Orange Chicken",
                "quantity_sold": 50,
                "total_sales": 499.50
            },
            ...
        ]
    """
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    sales_data = []

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                query = """
                    SELECT 
                        mi.menu_item_name, 
                        SUM(td.item_quantity_sold) AS quantity,
                        SUM(mi.price * td.item_quantity_sold) AS total_sales
                    FROM 
                        transactions t
                    JOIN 
                        transaction_details td ON t.transaction_id = td.transaction_id
                    JOIN 
                        menu_items mi ON td.menu_item_id = mi.menu_item_id
                    WHERE 
                        t.order_timestamp BETWEEN %s AND %s
                    GROUP BY 
                        mi.menu_item_name
                    ORDER BY 
                        mi.menu_item_name;
                """
                cur.execute(query, (start_date, end_date))
                results = cur.fetchall()

                sales_data = [
                    {
                        "menu_item_name": row["menu_item_name"],
                        "quantity_sold": row["quantity"],
                        "total_sales": row["total_sales"],
                    }
                    for row in results
                ]

        return jsonify(sales_data), 200
    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 500


@reports_bp.route("/popularityAnalysis", methods=["GET"])
def get_popularity_analysis():
    """
    Analyzes menu item popularity based on sales volume.

    Query Parameters:
        start_date (str): Start of the date range (ISO format)
        end_date (str): End of the date range (ISO format)
        limit (int): Maximum number of items to return

    Returns:
        tuple: JSON response with:
            - list of top-selling menu items
            - HTTP 200 on success
            - HTTP 500 on database errors

    Example Response:
        [
            "Orange Chicken",
            "Beijing Beef",
            ...
        ]
    """
    # Get query parameters
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    limit = request.args.get("limit", type=int)

    top_selling_menu_items = []

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                query = """
                    SELECT 
                        mi.menu_item_name AS menu_item 
                    FROM 
                        transactions t
                    JOIN 
                        transaction_details td ON t.transaction_id = td.transaction_id
                    JOIN 
                        menu_items mi ON td.menu_item_id = mi.menu_item_id
                    WHERE 
                        t.order_timestamp BETWEEN %s AND %s
                    GROUP BY 
                        mi.menu_item_name
                    ORDER BY 
                        SUM(td.item_quantity_sold) DESC
                    LIMIT %s;
                """
                cur.execute(query, (start_date, end_date, limit))
                results = cur.fetchall()

                top_selling_menu_items = [row["menu_item"] for row in results]

        return jsonify(top_selling_menu_items), 200
    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 500
