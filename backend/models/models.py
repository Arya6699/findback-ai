from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="user")  # 'user' or 'admin'
    google_id = Column(String, nullable=True, index=True)
    avatar_url = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    lost_items = relationship("LostItem", back_populates="user", cascade="all, delete-orphan")
    found_items = relationship("FoundItem", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class LostItem(Base):
    __tablename__ = "lost_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    color = Column(String, nullable=False, index=True)
    brand = Column(String, nullable=True)
    location = Column(String, nullable=False, index=True)
    date_lost = Column(String, nullable=False)  # ISO string YYYY-MM-DD
    image_url = Column(String, nullable=True)
    additional_details = Column(Text, nullable=True)
    status = Column(String, default="active")  # 'active', 'matched', 'returned'
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="lost_items")
    matches = relationship("Match", back_populates="lost_item", cascade="all, delete-orphan")


class FoundItem(Base):
    __tablename__ = "found_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    color = Column(String, nullable=False, index=True)
    brand = Column(String, nullable=True)
    location = Column(String, nullable=False, index=True)
    date_found = Column(String, nullable=False)  # ISO string YYYY-MM-DD
    image_url = Column(String, nullable=True)
    additional_details = Column(Text, nullable=True)
    status = Column(String, default="active")  # 'active', 'matched', 'returned'
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="found_items")
    matches = relationship("Match", back_populates="found_item", cascade="all, delete-orphan")


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    lost_item_id = Column(Integer, ForeignKey("lost_items.id"), nullable=False)
    found_item_id = Column(Integer, ForeignKey("found_items.id"), nullable=False)
    total_score = Column(Float, nullable=False)
    text_score = Column(Float, nullable=False)
    image_score = Column(Float, nullable=True)
    category_score = Column(Float, nullable=False)
    color_score = Column(Float, nullable=False)
    brand_score = Column(Float, nullable=False)
    location_score = Column(Float, nullable=False)
    date_score = Column(Float, nullable=False)
    explanations_json = Column(Text, nullable=False)  # JSON string of bullet explanations
    status = Column(String, default="potential")  # 'potential', 'confirmed', 'rejected', 'returned'
    created_at = Column(DateTime, default=datetime.utcnow)

    lost_item = relationship("LostItem", back_populates="matches")
    found_item = relationship("FoundItem", back_populates="matches")
    notifications = relationship("Notification", back_populates="match", cascade="all, delete-orphan")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
    match = relationship("Match", back_populates="notifications")
