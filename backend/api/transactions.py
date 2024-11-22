from flask import request, jsonify, Blueprint
import psycopg2
from datetime import datetime
from .database import get_db_connection

transactions_bp = Blueprint('transactions', __name__, url_prefix = '/api/transactions')

"""
Creates a new transaction, updating inventory levels and inserting transaction details in the database.

Input JSON:
- items: Dictionary where the key is the menu item name and the value is the quantity of the item ordered
- customer: name of the customer ordering
- customer_id: customer account
- employee: Name of the employee handling the transaction

Returns total price of the transaction, or None if the transaction fails
"""
@transactions_bp.route('/create', methods=['POST'])
def create_transaction():
    
    data = request.json
    items = data['items']
    customer = data['customer']
    employee = data['employee']
    customer_id = data['customer_id']
    
    total_price = 0.0

    try:
        with get_db_connection() as conn:
            
            with conn.cursor() as cur:

                # get employee ID
                cur.execute("SELECT employee_id FROM employees WHERE employee_name = %s", (employee,))
                employee_id = cur.fetchone()
                if employee_id:
                    employee_id = employee_id[0]
                print(f"Retrieved employeeId: {employee_id}")

                # calculate total price with given menu item input
                for menu_item, quantity in items.items():
                    cur.execute("SELECT price FROM menu_items WHERE menu_item_name = %s", (menu_item,))
                    price_result = cur.fetchone()
                    if price_result:
                        total_price += price_result[0] * quantity
                    
                    # get points for a menu item and update user points
                    cur.execute("SELECT points FROM menu_items WHERE menu_item_name = %s", (menu_item,))
                    points = cur.fetchone()
                    if points:
                        cur.execute("UPDATE users SET total_points = total_points + %s WHERE id = %s", (points, customer_id,))
                        cur.execute("UPDATE users SET current_points = current_points + %s WHERE id = %s", (points, customer_id,))

                # insert the transaction
                cur.execute("""
                    INSERT INTO transactions (customer, price, order_timestamp, employee_id, customer_id) 
                    VALUES (%s, %s, %s, %s, %s) RETURNING transaction_id
                """, (customer, total_price, datetime.now(), employee_id, customer_id))
                transaction_id = cur.fetchone()[0]
                # print(f"Retrieved TransactionID: {transaction_id}")

                # process each menu item
                for menu_item, quantity in items.items():
                    # get menu item ID
                    cur.execute("SELECT menu_item_id FROM menu_items WHERE menu_item_name = %s", (menu_item,))
                    menu_item_id = cur.fetchone()
                    if menu_item_id:
                        menu_item_id = menu_item_id[0]
                    print(f"Retrieved the Menu Item ID for {menu_item}: {menu_item_id}")

                    # get ingredients for menu item
                    cur.execute("""
                        SELECT ingredient_id, ingredient_amount FROM menu_items_ingredients 
                        WHERE menu_item_id = %s
                    """, (menu_item_id,))
                    ingredient_results = cur.fetchall()

                    for ingredient_id, ingredient_amount in ingredient_results:
                        # check stock level
                        cur.execute("SELECT stock FROM ingredients WHERE ingredient_id = %s", (ingredient_id,))
                        stock_result = cur.fetchone()
                        if stock_result:
                            current_stock = stock_result[0]
                            required_stock = quantity * ingredient_amount

                            # update inventory if stock is sufficient
                            if current_stock >= required_stock:
                                cur.execute("""
                                    UPDATE ingredients SET stock = stock - %s 
                                    WHERE ingredient_id = %s
                                """, (required_stock, ingredient_id))
                                print(f"Updated inventory for ingredient ID: {ingredient_id}")

                            else:
                                raise psycopg2.DatabaseError(f"Insufficient stock for ingredient ID: {ingredient_id}")

                    # insert transaction details
                    cur.execute("""
                        INSERT INTO transaction_details (transaction_id, menu_item_id, item_quantity_sold) 
                        VALUES (%s, %s, %s)
                    """, (transaction_id, menu_item_id, quantity))
                    print(f"Inserted into transaction_details for menu item: {menu_item}")

    except psycopg2.Error as e:
        conn.rollback()
        print(f"Transaction failed: {e}")
        return None

    return jsonify({"total_price": total_price}), 201