from solar import Table, ColumnDetails
from typing import Optional
from datetime import datetime
import uuid

class TimelineItem(Table):
    __tablename__ = "timeline_items"
    id: uuid.UUID = ColumnDetails(default_factory=uuid.uuid4, primary_key=True)
    project_id: uuid.UUID  # Reference to the project
    user_id: uuid.UUID  # Reference to the user who created this timeline item
    title: str
    description: str
    milestone_type: str  # e.g., "planning", "milestone", "update", "completion"
    target_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    is_completed: bool = ColumnDetails(default=False)
    order_index: int  # For ordering timeline items
    created_at: datetime = ColumnDetails(default_factory=datetime.now)