from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column
from ..app import db

class User(db.Model):
    __tablename__ = 'users'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False) # manufacturer, distributor, hospital, regulator

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role
        }
