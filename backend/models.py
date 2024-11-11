from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(50))
    account = db.Column(db.String(50))

    def __init__(self, email, name, account=None):
        self.email = email
        self.name = name
        self.account = account
