from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Plugin(Base):
    __tablename__ = "plugins"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    display_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    repository_url = Column(String(500), nullable=True)
    homepage_url = Column(String(500), nullable=True)
    license = Column(String(50), default="MIT")
    is_external = Column(Boolean, default=False)
    external_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    agents = relationship("Agent", back_populates="plugin", cascade="all, delete-orphan")
    skills = relationship("Skill", back_populates="plugin", cascade="all, delete-orphan")
    commands = relationship("Command", back_populates="plugin", cascade="all, delete-orphan")


class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    plugin_id = Column(Integer, ForeignKey("plugins.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    model_alias = Column(String(50), nullable=True)
    tools = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    plugin = relationship("Plugin", back_populates="agents")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    plugin_id = Column(Integer, ForeignKey("plugins.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    plugin = relationship("Plugin", back_populates="skills")


class Command(Base):
    __tablename__ = "commands"

    id = Column(Integer, primary_key=True, index=True)
    plugin_id = Column(Integer, ForeignKey("plugins.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    usage = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    plugin = relationship("Plugin", back_populates="commands")


class Harness(Base):
    __tablename__ = "harnesses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    install_method = Column(Text, nullable=False)
    capabilities = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())