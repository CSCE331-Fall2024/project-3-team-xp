from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(50))
    account = db.Column(db.String(50))
    current_points = db.Column(db.Integer)
    total_points = db.Column(db.Integer)

    def __init__(self, email, name, account=None, current_points=0, total_points=0):
        self.email = email
        self.name = name
        self.account = account
        self.current_points = current_points
        self.total_points = total_points
