import uuid
import enum
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..app import db

class DrugBatchStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    FLAGGED = "FLAGGED"
    VERIFIED = "VERIFIED"
    RECALLED = "RECALLED"

class DrugBatch(db.Model):
    __tablename__ = 'drug_batches'
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    batch_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    drug_name: Mapped[str] = mapped_column(String(100), nullable=False)
    manufacturer: Mapped[str] = mapped_column(String(100), nullable=False)
    manufacture_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expiry_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    current_location: Mapped[str] = mapped_column(String(255), nullable=True)
    temperature_threshold: Mapped[float] = mapped_column(Float, default=8.0)
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE")
    blockchain_tx_hash: Mapped[str] = mapped_column(String(255), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    sensor_logs: Mapped[List["SensorLog"]] = relationship(back_populates='batch', lazy=True)

    def to_dict(self):
        return {
            'id': str(self.id),
            'batch_id': self.batch_id,
            'drug_name': self.drug_name,
            'manufacturer': self.manufacturer,
            'manufacture_date': self.manufacture_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat(),
            'quantity': self.quantity,
            'current_location': self.current_location,
            'temperature_threshold': self.temperature_threshold,
            'status': self.status,
            'blockchain_tx_hash': self.blockchain_tx_hash,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
