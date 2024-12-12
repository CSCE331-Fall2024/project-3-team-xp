from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    """
    User model for storing user information in the database.
    
    Attributes:
    - id: Primary key, unique identifier for the user
    - email: User's email address, must be unique and not nullable
    - name: User's name
    - account: Type of user account (e.g., Manager)
    - current_points: Current points the user has
    - total_points: Total points the user has accumulated
    """
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(50))
    account = db.Column(db.String(50))
    current_points = db.Column(db.Integer)
    total_points = db.Column(db.Integer)

    def __init__(self, email, name, account=None, current_points=0, total_points=0):
        """
        Initializes a new User instance.
        
        Args:
        - email: User's email address
        - name: User's name
        - account: Type of user account (default is None)
        - current_points: Current points the user has (default is 0)
        - total_points: Total points the user has accumulated (default is 0)
        """
        self.email = email
        self.name = name
        self.account = account
        self.current_points = current_points
        self.total_points = total_points
