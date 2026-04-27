import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..app import db

class AlertSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class Alert(db.Model):
    __tablename__ = 'alerts'
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    batch_uuid: Mapped[uuid.UUID] = mapped_column(ForeignKey('drug_batches.id'), nullable=False)
    
    anomaly_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="MEDIUM")
    root_cause: Mapped[str] = mapped_column(Text, nullable=True)
    gemini_analysis: Mapped[str] = mapped_column(Text, nullable=True)
    
    is_acknowledged: Mapped[bool] = mapped_column(Boolean, default=False)
    acknowledged_by: Mapped[str] = mapped_column(String(100), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    batch: Mapped["DrugBatch"] = relationship()

    def to_dict(self):
        return {
            'id': str(self.id),
            'batch_id': self.batch.batch_id if self.batch else None,
            'anomaly_type': self.anomaly_type,
            'severity': self.severity,
            'root_cause': self.root_cause,
            'gemini_analysis': self.gemini_analysis,
            'is_acknowledged': self.is_acknowledged,
            'acknowledged_by': self.acknowledged_by,
            'created_at': self.created_at.isoformat()
        }
