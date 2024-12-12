"""
Database Connection Module

This module handles PostgreSQL database connections for the POS system.
It uses environment variables for secure configuration and implements
connection management using psycopg2.

Environment Variables Required:
    - DB_NAME: Database name
    - DB_USER: Database user
    - DB_PASSWORD: Database password
    - DB_URL: Database host URL
    - DB_PORT: Database port (defaults to 5432)
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    """
    Creates and returns a new PostgreSQL database connection.
    
    Uses environment variables for connection parameters to ensure security.
    The connection object is configured with RealDictCursor for JSON-like results.
    
    Returns:
        psycopg2.connection: Database connection object if successful
        None: If connection fails
        
    Raises:
        psycopg2.Error: Prints error message if connection fails
    
    Usage:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM table")
    """
    try:
        conn = psycopg2.connect(
            dbname=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            host=os.getenv('DB_URL'),
            port=os.getenv('DB_PORT', '5432')
        )
        return conn
    except psycopg2.Error as e:
        print(f"Error connecting to the database: {e}")
        return None