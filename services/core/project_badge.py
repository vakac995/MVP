from solar import Table, ColumnDetails
from typing import Optional
from datetime import datetime
import uuid

class ProjectBadge(Table):
    __tablename__ = "project_badges"
    
    id: uuid.UUID = ColumnDetails(default_factory=uuid.uuid4, primary_key=True)
    project_id: uuid.UUID  # Reference to project
    badge_id: uuid.UUID  # Reference to badge
    earned_at: datetime = ColumnDetails(default_factory=datetime.now)
    
    # Context for when/how badge was earned
    earned_value: Optional[int] = None  # The value that triggered the badge (e.g., vote count)
    time_to_earn: Optional[int] = None  # Hours/days to earn badge (for time-based badges)
    
    # Badge visibility
    is_active: bool = True  # Whether badge is currently displayed
    is_featured: bool = False  # Whether to prominently display this badge