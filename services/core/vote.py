from solar import Table, ColumnDetails
from datetime import datetime
import uuid

class Vote(Table):
    __tablename__ = "votes"
    id: uuid.UUID = ColumnDetails(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID  # Reference to the user who voted
    project_id: uuid.UUID  # Reference to the project being voted on
    created_at: datetime = ColumnDetails(default_factory=datetime.now)