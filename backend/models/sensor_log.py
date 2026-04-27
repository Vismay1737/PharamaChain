import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..app import db

class SensorLog(db.Model):
    __tablename__ = 'sensor_logs'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    batch_uuid: Mapped[uuid.UUID] = mapped_column(ForeignKey('drug_batches.id'), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    temperature: Mapped[float] = mapped_column(Float, nullable=False)
    humidity: Mapped[float] = mapped_column(Float, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    seal_intact: Mapped[bool] = mapped_column(Boolean, default=True)
    
    anomaly_score: Mapped[float] = mapped_column(Float, default=0.0)
    is_anomaly: Mapped[bool] = mapped_column(Boolean, default=False)
    gemini_analysis: Mapped[str] = mapped_column(Text, nullable=True)
    
    batch: Mapped["DrugBatch"] = relationship(back_populates='sensor_logs')

    def to_dict(self):
        return {
            'id': self.id,
            'batch_id': str(self.batch_uuid),
            'timestamp': self.timestamp.isoformat(),
            'temperature': self.temperature,
            'humidity': self.humidity,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'seal_intact': self.seal_intact,
            'anomaly_score': self.anomaly_score,
            'is_anomaly': self.is_anomaly,
            'gemini_analysis': self.gemini_analysis
        }
