from flask import Flask
from .api.employees import employees_bp 
from .api.transactions import transactions_bp
from .api.menuitems import menuitem_bp
from .api.reports import reports_bp
from .api.ingredients import ingredients_bp
from .auth import oauth_bp, init_oauth
from .models import db

from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.secret_key = os.getenv('SECRET_KEY')
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
    app.config['SESSION_COOKIE_SECURE'] = True
    
    init_oauth(app)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_URL')}/{os.getenv('DB_NAME')}"
    
    db.init_app(app)

    with app.app_context():
        db.create_all()
        
    register_blueprints(app)
    app.register_blueprint(oauth_bp)

    FRONTEND_URL = os.getenv("FRONTEND_URL")
    CORS(app, supports_credentials=True, origins=[FRONTEND_URL])

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
