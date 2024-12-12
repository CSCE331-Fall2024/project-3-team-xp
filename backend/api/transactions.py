from flask import request, jsonify, Blueprint
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
from .database import get_db_connection
import math

transactions_bp = Blueprint("transactions", __name__, url_prefix="/api/transactions")


@transactions_bp.route("/create", methods=["POST"])
def create_transaction():
    """
    Creates a new transaction, updating inventory levels and inserting transaction details in the database.

    Input JSON:
    - items: Dictionary where the key is the menu item name and the value is the quantity of the item ordered
    - customer: name of the customer ordering
    - customer_id: customer account
    - employee: Name of the employee handling the transaction
    - total_price: Total price of the transaction
    - discount_points: Points to be discounted from the customer's account

    Returns:
    - JSON response with a message and transaction ID if successful
    - None if the transaction fails
    """

    data = request.json
    items = data["items"]
    customer = data["customer"]
    employee = data["employee"]
    customer_id = data["customer_id"]
    total_price = data["total_price"]
    discount_points = data["discount_points"]

    try:
        with get_db_connection() as conn:

            with conn.cursor() as cur:

                # get employee ID
                cur.execute(
                    "SELECT employee_id FROM employees WHERE employee_name = %s",
                    (employee,),
                )
                employee_id = cur.fetchone()
                if employee_id:
                    employee_id = employee_id[0]
                print(f"Retrieved employeeId: {employee_id}")

                # calculate total price with given menu item input
                # for menu_item, quantity in items.items():
                #     cur.execute("SELECT price FROM menu_items WHERE menu_item_name = %s", (menu_item,))
                #     price_result = cur.fetchone()
                #     if price_result:
                #         total_price += price_result[0] * quantity

                points = math.floor(total_price) * 10
                cur.execute(
                    "UPDATE users SET total_points = total_points + %s WHERE id = %s",
                    (
                        points,
                        customer_id,
                    ),
                )
                cur.execute(
                    "UPDATE users SET current_points = current_points + %s WHERE id = %s",
                    (
                        points,
                        customer_id,
                    ),
                )
                cur.execute(
                    "UPDATE users SET current_points = current_points - %s WHERE id = %s", 
                    (
                        discount_points,
                        customer_id,
                    )
                )

                # insert the transaction
                cur.execute(
                    """
                    INSERT INTO transactions (customer, price, order_timestamp, employee_id, customer_id) 
                    VALUES (%s, %s, %s, %s, %s) RETURNING transaction_id
                """,
                    (customer, total_price, datetime.now(), employee_id, customer_id),
                )
                transaction_id = cur.fetchone()[0]
                # print(f"Retrieved TransactionID: {transaction_id}")

                # process each menu item
                for menu_item, quantity in items.items():
                    # get menu item ID
                    cur.execute(
                        "SELECT menu_item_id FROM menu_items WHERE menu_item_name = %s",
                        (menu_item,),
                    )
                    menu_item_id = cur.fetchone()
                    if menu_item_id:
                        menu_item_id = menu_item_id[0]
                    print(f"Retrieved the Menu Item ID for {menu_item}: {menu_item_id}")

                    # get ingredients for menu item
                    cur.execute(
                        """
                        SELECT ingredient_id, ingredient_amount FROM menu_items_ingredients 
                        WHERE menu_item_id = %s
                    """,
                        (menu_item_id,),
                    )
                    ingredient_results = cur.fetchall()

                    for ingredient_id, ingredient_amount in ingredient_results:
                        # check stock level
                        cur.execute(
                            "SELECT stock FROM ingredients WHERE ingredient_id = %s",
                            (ingredient_id,),
                        )
                        stock_result = cur.fetchone()
                        if stock_result:
                            current_stock = stock_result[0]
                            required_stock = quantity * ingredient_amount

                            # update inventory if stock is sufficient
                            if current_stock >= required_stock:
                                cur.execute(
                                    """
                                    UPDATE ingredients SET stock = stock - %s 
                                    WHERE ingredient_id = %s
                                """,
                                    (required_stock, ingredient_id),
                                )
                                print(
                                    f"Updated inventory for ingredient ID: {ingredient_id}"
                                )

                            else:
                                raise psycopg2.DatabaseError(
                                    f"Insufficient stock for ingredient ID: {ingredient_id}"
                                )

                    # insert transaction details
                    cur.execute(
                        """
                        INSERT INTO transaction_details (transaction_id, menu_item_id, item_quantity_sold) 
                        VALUES (%s, %s, %s)
                    """,
                        (transaction_id, menu_item_id, quantity),
                    )
                    print(
                        f"Inserted into transaction_details for menu item: {menu_item}"
                    )

    except psycopg2.Error as e:
        conn.rollback()
        print(f"Transaction failed: {e}")
        return None

    return (
        jsonify({"message": "Transaction created", "transaction_id": transaction_id}),
        201,
    )


@transactions_bp.route("/price", methods=["POST"])
def get_price():
    """
    Calculates the total price of the items in the order.

    Input JSON:
    - items: Dictionary where the key is the menu item name and the value is the quantity of the item ordered

    Returns:
    - JSON response with a message and the calculated price
    """

    data = request.json
    items = data["items"]

    price = 0

    try:

        with get_db_connection() as conn:
            with conn.cursor() as cur:
                for menu_item, quantity in items.items():
                    cur.execute(
                        "SELECT price FROM menu_items WHERE menu_item_name = %s",
                        (menu_item,),
                    )
                    price_result = cur.fetchone()
                    if price_result:
                        price += price_result[0] * quantity

    except psycopg2.Error as e:
        conn.rollback()
        print(f"Unable to get price with error: {e}")

    return jsonify({"message": "Price calculated", "price": price}), 200


@transactions_bp.route("/points", methods=["GET"])
def get_points():
    """
    Retrieves the current and total points for a user.

    Query Parameters:
    - user_id: ID of the user

    Returns:
    - JSON response with the current and total points of the user
    """

    user_id = request.args.get("user_id")

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT current_points, total_points FROM users WHERE id = %s", (user_id,)
                )
                points = cur.fetchall()
        return jsonify(points), 200
    except psycopg2.Error as e:
        print(f"Error getting points: {e}")
        return jsonify({"error": "Error getting the list of allergens"}), 500
