from solar import Table, ColumnDetails
from typing import Optional
from datetime import datetime
import uuid

class User(Table):
  __tablename__ = "users"
  id: uuid.UUID = ColumnDetails(primary_key=True)
  email: str
  
  # Extended registration fields
  username: Optional[str] = None  # Unique username for display
  full_name: Optional[str] = None  # Display name
  phone_number: Optional[str] = None  # For project updates
  location: Optional[str] = None  # City/neighborhood
  bio: Optional[str] = None  # Max 200 characters
  profile_picture_url: Optional[str] = None  # Profile avatar
  
  # Registration metadata
  registration_date: Optional[datetime] = None  # When user registered
  email_verified: Optional[bool] = None  # Email verification status
  newsletter_opt_in: Optional[bool] = None  # Marketing emails
  terms_accepted_at: Optional[datetime] = None  # When terms were accepted
  
  # Badge-related fields
  badge_count: Optional[int] = None  # Total badges earned
  featured_badge_id: Optional[uuid.UUID] = None  # Which badge to prominently display
  