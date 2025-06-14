from typing import List, Optional, Dict, Any
from uuid import UUID
from solar.access import User, authenticated, public
from core.donation import Donation
from core.project import Project
from core.badge_service import check_badges_after_donation

@authenticated
def create_donation(user: User, project_id: UUID, amount: float, message: str = "", 
                   is_anonymous: bool = False, currency: str = "EUR") -> Donation:
    """Create a donation for a project."""
    # Validate project exists
    project_exists = Project.sql("SELECT id FROM projects WHERE id = %(project_id)s", {"project_id": project_id})
    if not project_exists:
        raise ValueError("Project not found")
    
    if amount <= 0:
        raise ValueError("Donation amount must be positive")
    
    # Create donation
    donation = Donation(
        user_id=user.id,
        project_id=project_id,
        amount=amount,
        message=message,
        is_anonymous=is_anonymous,
        currency=currency
    )
    donation.sync()
    
    # Update project funding
    Project.sql("""
        UPDATE projects 
        SET current_funding = current_funding + %(amount)s 
        WHERE id = %(project_id)s
    """, {"amount": amount, "project_id": project_id})
    
    # Check and award badges after donation
    check_badges_after_donation(project_id, user.id)
    
    return donation

@public
def get_project_donations(project_id: UUID, include_anonymous: bool = True) -> List[Donation]:
    """Get donations for a project."""
    if include_anonymous:
        results = Donation.sql("""
            SELECT * FROM donations 
            WHERE project_id = %(project_id)s 
            ORDER BY created_at DESC
        """, {"project_id": project_id})
    else:
        results = Donation.sql("""
            SELECT * FROM donations 
            WHERE project_id = %(project_id)s AND is_anonymous = FALSE
            ORDER BY created_at DESC
        """, {"project_id": project_id})
    
    return [Donation(**result) for result in results]

@public
def get_donation_statistics(project_id: UUID) -> Dict[str, Any]:
    """Get donation statistics for a project."""
    stats = Donation.sql("""
        SELECT 
            COUNT(*) as donor_count,
            COALESCE(SUM(amount), 0) as total_amount,
            COALESCE(AVG(amount), 0) as average_amount,
            COALESCE(MAX(amount), 0) as largest_amount
        FROM donations 
        WHERE project_id = %(project_id)s
    """, {"project_id": project_id})[0]
    
    return {
        "donor_count": stats["donor_count"],
        "total_amount": float(stats["total_amount"]),
        "average_amount": float(stats["average_amount"]),
        "largest_amount": float(stats["largest_amount"])
    }

@authenticated
def get_user_donations(user: User) -> List[Donation]:
    """Get all donations made by a user."""
    results = Donation.sql("""
        SELECT * FROM donations 
        WHERE user_id = %(user_id)s 
        ORDER BY created_at DESC
    """, {"user_id": user.id})
    
    return [Donation(**result) for result in results]

@public
def get_recent_donations(limit: int = 10) -> List[Donation]:
    """Get recent donations across all projects (excluding anonymous ones)."""
    results = Donation.sql("""
        SELECT * FROM donations 
        WHERE is_anonymous = FALSE
        ORDER BY created_at DESC 
        LIMIT %(limit)s
    """, {"limit": limit})
    
    return [Donation(**result) for result in results]

@public
def get_top_donors_for_project(project_id: UUID, limit: int = 5) -> List[Dict[str, Any]]:
    """Get top donors for a project (excluding anonymous)."""
    results = Donation.sql("""
        SELECT 
            user_id,
            SUM(amount) as total_donated,
            COUNT(*) as donation_count
        FROM donations 
        WHERE project_id = %(project_id)s AND is_anonymous = FALSE
        GROUP BY user_id
        ORDER BY total_donated DESC
        LIMIT %(limit)s
    """, {"project_id": project_id, "limit": limit})
    
    return [
        {
            "user_id": result["user_id"],
            "total_donated": float(result["total_donated"]),
            "donation_count": result["donation_count"]
        }
        for result in results
    ]

@authenticated
def get_user_donation_total(user: User) -> float:
    """Get total amount donated by a user."""
    result = Donation.sql("""
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM donations 
        WHERE user_id = %(user_id)s
    """, {"user_id": user.id})[0]
    
    return float(result["total"])