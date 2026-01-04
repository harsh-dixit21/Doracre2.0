import sqlite3
from datetime import datetime
from flask_bcrypt import generate_password_hash, check_password_hash

class User:
    def __init__(self, email, password, name=None, user_id=None, created_at=None):
        self.id = user_id
        self.email = email
        self.password = password
        self.name = name
        self.created_at = created_at or datetime.utcnow()

    @staticmethod
    def create_user(email, password, name):
        """Create a new user in the database"""
        from utils.database import get_db
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return None, "User already exists"
        
        # Hash password
        hashed_password = generate_password_hash(password).decode('utf-8')
        
        try:
            cursor.execute(
                'INSERT INTO users (email, password, name, created_at) VALUES (?, ?, ?, ?)',
                (email, hashed_password, name, datetime.utcnow())
            )
            conn.commit()
            user_id = cursor.lastrowid
            conn.close()
            return user_id, None
        except Exception as e:
            conn.close()
            return None, str(e)

    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        from utils.database import get_db
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT id, email, password, name, created_at FROM users WHERE email = ?', (email,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return User(
                user_id=row[0],
                email=row[1],
                password=row[2],
                name=row[3],
                created_at=row[4]
            )
        return None

    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        from utils.database import get_db
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT id, email, password, name, created_at FROM users WHERE id = ?', (user_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return User(
                user_id=row[0],
                email=row[1],
                password=row[2],
                name=row[3],
                created_at=row[4]
            )
        return None

    def verify_password(self, password):
        """Verify user password"""
        return check_password_hash(self.password, password)

    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }
