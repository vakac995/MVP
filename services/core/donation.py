from solar import Table, ColumnDetails
from datetime import datetime
import uuid

class Donation(Table):
    __tablename__ = "donations"
    id: uuid.UUID = ColumnDetails(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID  # Reference to the user who donated
    project_id: uuid.UUID  # Reference to the project receiving the donation
    amount: float
    currency: str = ColumnDetails(default="EUR")
    message: str = ColumnDetails(default="")  # Optional message from donor
    is_anonymous: bool = ColumnDetails(default=False)
    created_at: datetime = ColumnDetails(default_factory=datetime.now)