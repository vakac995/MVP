from solar import Table, ColumnDetails
from typing import Optional, List, Dict
from datetime import datetime
import uuid

class Project(Table):
    __tablename__ = "projects"
    id: uuid.UUID = ColumnDetails(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID  # Reference to the authenticated user who created the project
    title: str
    description: str
    status: str  # e.g., "planning", "in_progress", "completed"
    budget: float
    current_funding: float = ColumnDetails(default=0.0)
    vote_count: int = ColumnDetails(default=0)
    category: str
    tags: List[str] = ColumnDetails(default_factory=list)
    created_at: datetime = ColumnDetails(default_factory=datetime.now)
    updated_at: datetime = ColumnDetails(default_factory=datetime.now)