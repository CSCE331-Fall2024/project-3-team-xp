from flask import Flask, request, jsonify, Blueprint
import psycopg2
from psycopg2.extras import RealDictCursor
from .database import get_db_connection

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

"""
Fetches total product usage within a specified time range.

Query Params:
    - start_date (Timestamp)
    - end_date (Timestamp)

Returns:
    JSON object where keys are ingredient names, and values are total usage.
"""
@reports_bp.route('/productUsage', methods=['GET'])
def get_product_usage():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
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
                
                product_usage_data = {row['ingredient_name']: row['total_inventory_used'] for row in results}
            print("Emd queery")
                
        return jsonify(product_usage_data), 200
    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500






"""
Fetches total sales for the current day grouped by hour.

Returns:
    JSON object where keys are hours (Timestamp) and values are total sales (Float).
"""
@reports_bp.route('/salesByHour', methods=['GET'])

def get_current_sales_by_hour():
    
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
                
                sales_by_hour_data = {row["hour"]: row["total_sales"] for row in results}
                
        return jsonify(sales_by_hour_data), 200
    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500





"""
Fetches total sales for each employee for the current day.

Returns:
    JSON object where keys are employee names (String) and values are total sales amounts (Float).
"""
@reports_bp.route('/salesByEmployee', methods=['GET'])

def get_total_sales_by_employee():
    
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
                
                total_sales_by_employee = {row["employee_name"]: row["total_sales"] for row in results}
                
        return jsonify(total_sales_by_employee), 200
    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500




"""
Fetches a sales report within a specified time range.

Query Params:
    - start_date (Timestamp)
    - end_date (Timestamp)

Returns:
    JSON array of objects where each object contains:
        - menu_item_name (String)
        - quantity_sold (Integer)
        - total_sales (Float)
"""
@reports_bp.route('/salesReport', methods=['GET'])
def get_sales_report():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
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
                        "total_sales": row["total_sales"]
                    }
                    for row in results
                ]
                
        return jsonify(sales_data), 200
    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500






"""
Fetches the top N selling menu items within a specified time range.

Parameters:
    - start_date (Timestamp): Start of the date range.
    - end_date (Timestamp): End of the date range.
    - limit (int): Maximum number of items to return.

Returns:
    JSON list of top-selling menu items, limited to the specified number.
"""
@reports_bp.route('/popularityAnalysis', methods=['GET'])

def get_popularity_analysis():
    
    # Get query parameters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    limit = request.args.get('limit', type=int)

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
        return jsonify({'error': str(e)}), 500
