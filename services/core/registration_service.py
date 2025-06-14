from typing import Dict, Optional
from datetime import datetime
import uuid
import re

from core.user import User
from core.badge_service import calculate_user_badges
from solar.access import public

# ==================== Registration Service ====================

@public
def check_username_availability(username: str) -> Dict:
    """Check if a username is available and valid."""
    # Validate username format
    if not username or len(username) < 3 or len(username) > 20:
        return {
            "available": False,
            "error": "Username must be between 3 and 20 characters"
        }
    
    # Check if alphanumeric + underscore only
    if not re.match("^[a-zA-Z0-9_]+$", username):
        return {
            "available": False,
            "error": "Username can only contain letters, numbers, and underscores"
        }
    
    # Check if username already exists
    existing = User.sql(
        "SELECT id FROM users WHERE username = %(username)s",
        {"username": username}
    )
    
    if existing:
        return {
            "available": False,
            "error": "Username is already taken"
        }
    
    return {
        "available": True,
        "error": None
    }

@public
def check_email_availability(email: str) -> Dict:
    """Check if an email is available and valid."""
    # Basic email validation
    if not email or "@" not in email or "." not in email:
        return {
            "available": False,
            "error": "Please enter a valid email address"
        }
    
    # Check if email already exists
    existing = User.sql(
        "SELECT id FROM users WHERE email = %(email)s",
        {"email": email}
    )
    
    if existing:
        return {
            "available": False,
            "error": "An account with this email already exists"
        }
    
    return {
        "available": True,
        "error": None
    }

@public
def validate_password(password: str) -> Dict:
    """Validate password strength."""
    if not password or len(password) < 8:
        return {
            "valid": False,
            "strength": "weak",
            "error": "Password must be at least 8 characters long"
        }
    
    strength_score = 0
    
    # Check for uppercase
    if re.search(r"[A-Z]", password):
        strength_score += 1
    
    # Check for lowercase
    if re.search(r"[a-z]", password):
        strength_score += 1
    
    # Check for numbers
    if re.search(r"\d", password):
        strength_score += 1
    
    # Check for special characters
    if re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        strength_score += 1
    
    # Check length bonus
    if len(password) >= 12:
        strength_score += 1
    
    if strength_score < 2:
        strength = "weak"
    elif strength_score < 4:
        strength = "medium"
    else:
        strength = "strong"
    
    return {
        "valid": strength_score >= 2,
        "strength": strength,
        "error": None if strength_score >= 2 else "Password is too weak"
    }

@public
def register_user(
    email: str,
    password: str,
    username: str,
    full_name: Optional[str] = None,
    phone_number: Optional[str] = None,
    location: Optional[str] = None,
    bio: Optional[str] = None,
    newsletter_opt_in: bool = False,
    terms_accepted: bool = False
) -> Dict:
    """Register a new user account."""
    
    # Validate required fields
    if not terms_accepted:
        return {
            "success": False,
            "error": "You must accept the terms and conditions"
        }
    
    # Check email availability
    email_check = check_email_availability(email)
    if not email_check["available"]:
        return {
            "success": False,
            "error": email_check["error"]
        }
    
    # Check username availability
    username_check = check_username_availability(username)
    if not username_check["available"]:
        return {
            "success": False,
            "error": username_check["error"]
        }
    
    # Validate password
    password_check = validate_password(password)
    if not password_check["valid"]:
        return {
            "success": False,
            "error": password_check["error"]
        }
    
    # Validate bio length
    if bio and len(bio) > 200:
        return {
            "success": False,
            "error": "Bio must be 200 characters or less"
        }
    
    try:
        # Create new user
        user_id = str(uuid.uuid4())
        now = datetime.now()
        
        # Note: In a real implementation, password would be hashed
        # For Solar auth system, we'll just store the user data
        new_user = User(
            id=user_id,
            email=email,
            username=username,
            full_name=full_name,
            phone_number=phone_number,
            location=location,
            bio=bio,
            registration_date=now,
            email_verified=False,  # Would be set to True after email verification
            newsletter_opt_in=newsletter_opt_in,
            terms_accepted_at=now,
            badge_count=0
        )
        
        new_user.sync()
        
        # Award newcomer badge
        badges_awarded = calculate_user_badges(user_id)
        
        return {
            "success": True,
            "user_id": user_id,
            "message": "Account created successfully! Please check your email to verify your account.",
            "badges_awarded": len(badges_awarded)
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to create account: {str(e)}"
        }

@public
def send_verification_email(user_id: str) -> Dict:
    """Send email verification (simulated for now)."""
    # In a real implementation, this would send an actual email
    # For now, we'll just simulate the process
    
    try:
        # Update user record with verification token (simulated)
        verification_token = str(uuid.uuid4())
        
        # In real implementation, you'd store this token and send email
        # User.sql(
        #     "UPDATE users SET email_verification_token = %(token)s WHERE id = %(user_id)s",
        #     {"token": verification_token, "user_id": user_id}
        # )
        
        return {
            "success": True,
            "message": "Verification email sent! Please check your inbox.",
            "verification_token": verification_token  # Only for testing
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to send verification email: {str(e)}"
        }

@public
def verify_email(user_id: str, verification_token: str) -> Dict:
    """Verify user email address (simulated for now)."""
    # In a real implementation, this would check the token
    
    try:
        # Mark email as verified
        User.sql(
            "UPDATE users SET email_verified = true WHERE id = %(user_id)s",
            {"user_id": user_id}
        )
        
        return {
            "success": True,
            "message": "Email verified successfully!"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to verify email: {str(e)}"
        }

@public
def get_registration_stats() -> Dict:
    """Get registration statistics for admin dashboard."""
    try:
        # Total users
        total_users = User.sql("SELECT COUNT(*) as count FROM users")[0]["count"]
        
        # Users registered in last 30 days
        recent_users = User.sql(
            """
            SELECT COUNT(*) as count FROM users 
            WHERE registration_date >= NOW() - INTERVAL '30 days'
            """
        )[0]["count"]
        
        # Email verification rate
        verified_users = User.sql("SELECT COUNT(*) as count FROM users WHERE email_verified = true")[0]["count"]
        verification_rate = (verified_users / total_users * 100) if total_users > 0 else 0
        
        # Newsletter opt-in rate
        newsletter_users = User.sql("SELECT COUNT(*) as count FROM users WHERE newsletter_opt_in = true")[0]["count"]
        newsletter_rate = (newsletter_users / total_users * 100) if total_users > 0 else 0
        
        return {
            "total_users": total_users,
            "recent_users": recent_users,
            "verification_rate": round(verification_rate, 1),
            "newsletter_rate": round(newsletter_rate, 1),
            "verified_users": verified_users,
            "newsletter_users": newsletter_users
        }
        
    except Exception as e:
        return {
            "error": f"Failed to get registration stats: {str(e)}"
        }

@public
def update_user_profile(
    user_id: str,
    full_name: Optional[str] = None,
    phone_number: Optional[str] = None,
    location: Optional[str] = None,
    bio: Optional[str] = None,
    newsletter_opt_in: Optional[bool] = None
) -> Dict:
    """Update user profile information."""
    
    try:
        # Validate bio length
        if bio and len(bio) > 200:
            return {
                "success": False,
                "error": "Bio must be 200 characters or less"
            }
        
        # Build update query dynamically
        updates = []
        params = {"user_id": user_id}
        
        if full_name is not None:
            updates.append("full_name = %(full_name)s")
            params["full_name"] = full_name
            
        if phone_number is not None:
            updates.append("phone_number = %(phone_number)s")
            params["phone_number"] = phone_number
            
        if location is not None:
            updates.append("location = %(location)s")
            params["location"] = location
            
        if bio is not None:
            updates.append("bio = %(bio)s")
            params["bio"] = bio
            
        if newsletter_opt_in is not None:
            updates.append("newsletter_opt_in = %(newsletter_opt_in)s")
            params["newsletter_opt_in"] = newsletter_opt_in
        
        if updates:
            query = f"UPDATE users SET {', '.join(updates)} WHERE id = %(user_id)s"
            User.sql(query, params)
        
        return {
            "success": True,
            "message": "Profile updated successfully!"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to update profile: {str(e)}"
        }