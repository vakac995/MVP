from solar import Table, ColumnDetails
from typing import Optional
from datetime import datetime
import uuid

class Badge(Table):
    __tablename__ = "badges"
    
    id: uuid.UUID = ColumnDetails(default_factory=uuid.uuid4, primary_key=True)
    name: str  # e.g., "Rising Star", "Community Favorite"
    description: str  # e.g., "Project received 10+ votes in first 24 hours"
    category: str  # "project" or "user"
    badge_type: str  # unique identifier like "rising_star", "community_favorite"
    icon: str  # emoji or icon name for display
    color: str  # hex color for badge styling
    criteria_value: Optional[int] = None  # numeric threshold (e.g., 10 for votes)
    is_active: bool = True  # whether badge is currently being awarded
    created_at: datetime = ColumnDetails(default_factory=datetime.now)
    
    # For multi-criteria badges like "Community Leader"
    criteria_projects: Optional[int] = None
    criteria_votes: Optional[int] = None  
    criteria_donations: Optional[int] = None
    criteria_comments: Optional[int] = None