from solar import Table, ColumnDetails
from typing import Optional
from datetime import datetime
import uuid

class UserBadge(Table):
    __tablename__ = "user_badges"
    
    id: uuid.UUID = ColumnDetails(default_factory=uuid.uuid4, primary_key=True)
    user_id: str  # Reference to user (Solar auth system)
    badge_id: uuid.UUID  # Reference to badge
    earned_at: datetime = ColumnDetails(default_factory=datetime.now)
    
    # Optional context for why badge was earned
    context_project_id: Optional[uuid.UUID] = None  # Which project triggered the badge
    context_value: Optional[int] = None  # The actual value that earned the badge
    is_featured: bool = False  # Whether to prominently display this badge
    
    # For progress tracking
    progress_value: Optional[int] = None  # Current progress toward badge
    progress_updated: Optional[datetime] = None