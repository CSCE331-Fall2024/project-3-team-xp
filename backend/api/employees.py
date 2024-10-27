from flask import Flask, request, jsonify, Blueprint
import psycopg2
from psycopg2.extras import RealDictCursor
from .database import get_db_connection

employees_bp = Blueprint('employees', __name__, url_prefix = '/api/employees')

"""
Fetches all employees from the database and returns them as JSON.
"""
@employees_bp.route('/', methods=['GET'])
def get_employees():

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM employees;")
                employees = cur.fetchall()
        return jsonify(employees), 200
    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500

"""
Creates a new employee with provided details (JSON).

Input JSON: 
    - employee_name (String)
    - position (String)
"""
@employees_bp.route('/create', methods=['POST'])
def create_employee():

    data = request.json
    employee_name = data['employee_name']
    position = data['position']
    
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                query = """
                    INSERT INTO employees (employee_name, position, hire_date)
                    VALUES (%s, %s, NOW()) RETURNING employee_id;
                """
                cur.execute(query, (employee_name, position))
                employee_id = cur.fetchone()[0]
        return jsonify({'message': 'Employee created', 'employee_id': employee_id}), 201
    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500

"""
Updates the role of an employee based on the employee_name.

Input JSON:
    - employee_name (String)
    - position (String)
"""
@employees_bp.route('/update-role', methods=['PUT'])
def update_employee_role():
    
    data = request.json
    employee_name = data['employee_name']
    position = data['position']
    
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                query = "UPDATE employees SET position = %s WHERE employee_name = %s;"
                cur.execute(query, (position, employee_name))
        return jsonify({'message': 'Employee role updated successfully'}), 200
    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500