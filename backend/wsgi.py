from flask import Flask
from .api.employees import employees_bp 
from .api.transactions import transactions_bp
from .api.menuitems import menuitem_bp
from .api.reports import reports_bp
from .api.ingredients import ingredients_bp

from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    app.config['DB_USER'] = os.getenv('DB_USER')
    app.config['DB_PASSWORD'] = os.getenv('DB_PASSWORD')
    app.config['DB_URL'] = os.getenv('DB_URL')
    
    register_blueprints(app)

    CORS(app, supports_credentials=True)

    return app

def register_blueprints(app):
    app.register_blueprint(employees_bp)
    app.register_blueprint(transactions_bp)
    app.register_blueprint(menuitem_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(ingredients_bp)

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
