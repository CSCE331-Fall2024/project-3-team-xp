"""
Employee Management API Module

This module provides REST API endpoints for managing employee data in the system.
It handles creating, reading, updating, and soft-deleting employee records.

Endpoints:
    - GET /api/employees/ : Retrieve all active employees
    - POST /api/employees/create : Create a new employee
    - PUT /api/employees/update-role : Update an employee's role
    - PUT /api/employees/delete : Soft delete an employee
"""

from flask import Flask, request, jsonify, Blueprint
import psycopg2
from psycopg2.extras import RealDictCursor
from .database import get_db_connection

employees_bp = Blueprint("employees", __name__, url_prefix="/api/employees")


@employees_bp.route("/", methods=["GET"])
def get_employees():
    """
    Fetches all active employees from the database.

    Returns:
        tuple: JSON response containing:
            - list of employee records (each with id, name, position, hire_date)
            - HTTP status code 200 on success
            - HTTP status code 500 on database errors
    """

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM employees WHERE active = true;")
                employees = cur.fetchall()
        return jsonify(employees), 200
    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 500


@employees_bp.route("/create", methods=["POST"])
def create_employee():
    """
    Creates a new employee record in the database.

    Expected JSON payload:
        {
            "employee_name": str,
            "position": str
        }

    Returns:
        tuple: JSON response containing:
            - success message and created employee_id
            - HTTP status code 201 on success
            - HTTP status code 500 on database errors
    """
    data = request.json
    employee_name = data["employee_name"]
    position = data["position"]

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                query = """
                    INSERT INTO employees (employee_name, position, hire_date, active)
                    VALUES (%s, %s, NOW(), true) RETURNING employee_id;
                """
                cur.execute(query, (employee_name, position))
                employee_id = cur.fetchone()[0]
        return jsonify({"message": "Employee created", "employee_id": employee_id}), 201
    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 500


@employees_bp.route("/update-role", methods=["PUT"])
def update_employee_role():
    """
    Updates an employee's role/position in the database.

    Expected JSON payload:
        {
            "employee_name": str,
            "position": str
        }

    Returns:
        tuple: JSON response containing:
            - success message
            - HTTP status code 200 on success
            - HTTP status code 500 on database errors
    """
    data = request.json
    employee_name = data["employee_name"]
    position = data["position"]

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                query = "UPDATE employees SET position = %s WHERE employee_name = %s;"
                cur.execute(query, (position, employee_name))
        return jsonify({"message": "Employee role updated successfully"}), 200
    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 500


@employees_bp.route("/delete", methods=["PUT"])
def delete_employee():
    """
    Soft deletes an employee by setting their active status to false.

    Expected JSON payload:
        {
            "employee_id": str
        }

    Returns:
        tuple: JSON response containing:
            - success message
            - HTTP status code 200 on success
            - HTTP status code 500 on database errors
    """
    data = request.json
    employee_id = data["employee_id"]

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                query = "UPDATE employees SET active = false WHERE employee_id = %s;"
                cur.execute(query, (employee_id,))
        return jsonify({"message": "Employee removed successfully"}), 200
    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 500
