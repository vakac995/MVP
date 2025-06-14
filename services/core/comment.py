from solar import Table, ColumnDetails
from typing import Optional
from datetime import datetime
import uuid

class Comment(Table):
    __tablename__ = "comments"
    id: uuid.UUID = ColumnDetails(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID  # Reference to the user who created the comment
    project_id: uuid.UUID  # Reference to the project
    timeline_item_id: Optional[uuid.UUID] = None  # Reference to specific timeline item (if applicable)
    parent_comment_id: Optional[uuid.UUID] = None  # For threaded comments
    content: str
    created_at: datetime = ColumnDetails(default_factory=datetime.now)
    updated_at: datetime = ColumnDetails(default_factory=datetime.now)