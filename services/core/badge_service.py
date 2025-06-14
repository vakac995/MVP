from typing import List, Dict, Optional
from datetime import datetime, timedelta
import uuid

from core.badge import Badge
from core.user_badge import UserBadge
from core.project_badge import ProjectBadge
from core.project import Project
from core.vote import Vote
from core.donation import Donation
from core.comment import Comment
from core.user import User
from solar.access import public

# ==================== Badge Management ====================

@public
def get_all_badges() -> List[Badge]:
    """Get all available badges in the system."""
    return [Badge(**badge) for badge in Badge.sql("SELECT * FROM badges WHERE is_active = true ORDER BY category, name")]

@public
def get_project_badges(project_id: uuid.UUID) -> List[Dict]:
    """Get all badges for a specific project with badge details."""
    query = """
    SELECT pb.*, b.name, b.description, b.icon, b.color, b.badge_type, b.category
    FROM project_badges pb
    JOIN badges b ON pb.badge_id = b.id
    WHERE pb.project_id = %(project_id)s AND pb.is_active = true
    """
    results = Badge.sql(query, {"project_id": project_id})
    
    badges = []
    for result in results:
        badge_data = {
            "id": result["id"],
            "badge_id": result["badge_id"],
            "project_id": result["project_id"],
            "earned_at": result["earned_at"],
            "badge": {
                "name": result["name"],
                "description": result["description"],
                "icon": result["icon"],
                "color": result["color"],
                "badge_type": result["badge_type"],
                "category": result["category"]
            },
            "is_featured": result["is_featured"]
        }
        badges.append(badge_data)
    
    return badges

@public
def get_user_badges(user_id: str) -> List[Dict]:
    """Get all badges for a specific user with badge details."""
    query = """
    SELECT ub.*, b.name, b.description, b.icon, b.color, b.badge_type, b.category
    FROM user_badges ub
    JOIN badges b ON ub.badge_id = b.id
    WHERE ub.user_id = %(user_id)s
    """
    results = Badge.sql(query, {"user_id": user_id})
    
    badges = []
    for result in results:
        badge_data = {
            "id": result["id"],
            "badge_id": result["badge_id"],
            "user_id": result["user_id"],
            "earned_at": result["earned_at"],
            "badge": {
                "name": result["name"],
                "description": result["description"],
                "icon": result["icon"],
                "color": result["color"],
                "badge_type": result["badge_type"],
                "category": result["category"]
            },
            "is_featured": result["is_featured"],
            "progress_value": result["progress_value"]
        }
        badges.append(badge_data)
    
    return badges

@public
def set_featured_badge(user_id: str, badge_id: uuid.UUID) -> UserBadge:
    """Set a badge as featured for a user's profile."""
    # First, unfeature all badges for this user
    UserBadge.sql(
        "UPDATE user_badges SET is_featured = false WHERE user_id = %(user_id)s",
        {"user_id": user_id}
    )
    
    # Then, feature the selected badge
    UserBadge.sql(
        "UPDATE user_badges SET is_featured = true WHERE user_id = %(user_id)s AND badge_id = %(badge_id)s",
        {"user_id": user_id, "badge_id": badge_id}
    )
    
    # Also update the user's featured badge
    User.sql(
        "UPDATE users SET featured_badge_id = %(badge_id)s WHERE id = %(user_id)s",
        {"user_id": user_id, "badge_id": badge_id}
    )
    
    # Return the updated badge
    results = UserBadge.sql(
        "SELECT * FROM user_badges WHERE user_id = %(user_id)s AND badge_id = %(badge_id)s",
        {"user_id": user_id, "badge_id": badge_id}
    )
    
    if not results:
        return None
    
    return UserBadge(**results[0])

# ==================== Badge Calculation Logic ====================

def calculate_project_badges(project_id: uuid.UUID) -> List[ProjectBadge]:
    """Calculate and award badges for a project based on its activity."""
    # Get the project data
    project_results = Project.sql("SELECT * FROM projects WHERE id = %(project_id)s", {"project_id": project_id})
    if not project_results:
        return []
    
    project = Project(**project_results[0])
    
    # Get badge definitions
    badge_definitions = Badge.sql("SELECT * FROM badges WHERE category = 'project' AND is_active = true")
    badges_to_award = []
    
    for badge_def in badge_definitions:
        badge_type = badge_def["badge_type"]
        badge_id = badge_def["id"]
        
        # Check if badge already awarded
        existing = ProjectBadge.sql(
            "SELECT * FROM project_badges WHERE project_id = %(project_id)s AND badge_id = %(badge_id)s",
            {"project_id": project_id, "badge_id": badge_id}
        )
        
        if existing:
            continue  # Skip already awarded badges
            
        # Check each badge type's criteria
        if badge_type == "rising_star":
            # Rising Star: 10+ votes in first 24 hours
            created_date = project.created_at
            vote_count = _count_votes_in_timeframe(project_id, created_date, created_date + timedelta(days=1))
            
            if vote_count >= 10:
                badges_to_award.append(_create_project_badge(project_id, badge_id, earned_value=vote_count))
                
        elif badge_type == "community_favorite":
            # Community Favorite: 50+ total votes
            vote_count = _count_votes(project_id)
            
            if vote_count >= 50:
                badges_to_award.append(_create_project_badge(project_id, badge_id, earned_value=vote_count))
                
        elif badge_type == "peoples_choice":
            # People's Choice: 100+ total votes
            vote_count = _count_votes(project_id)
            
            if vote_count >= 100:
                badges_to_award.append(_create_project_badge(project_id, badge_id, earned_value=vote_count))
                
        elif badge_type == "fully_funded":
            # Fully Funded: Reached 100% of donation goal
            if project.budget and project.budget > 0:
                donation_total = _get_donation_total(project_id)
                if donation_total >= project.budget:
                    badges_to_award.append(_create_project_badge(project_id, badge_id, earned_value=int(donation_total)))
                    
        elif badge_type == "overfunded":
            # Overfunded: Exceeded donation goal by 50%+
            if project.budget and project.budget > 0:
                donation_total = _get_donation_total(project_id)
                if donation_total >= (project.budget * 1.5):
                    badges_to_award.append(_create_project_badge(project_id, badge_id, earned_value=int(donation_total)))
                    
        elif badge_type == "active_discussion":
            # Active Discussion: 25+ comments
            comment_count = _count_comments(project_id)
            
            if comment_count >= 25:
                badges_to_award.append(_create_project_badge(project_id, badge_id, earned_value=comment_count))
                
        elif badge_type == "trending":
            # Trending: Most votes in the last 7 days
            # This is more complex and would require comparing against other projects
            # Simplified version for now:
            recent_votes = _count_votes_in_timeframe(project_id, datetime.now() - timedelta(days=7), datetime.now())
            if recent_votes >= 20:  # Arbitrary threshold for "trending"
                badges_to_award.append(_create_project_badge(project_id, badge_id, earned_value=recent_votes))
    
    # Save all new badges
    if badges_to_award:
        ProjectBadge.sync_many(badges_to_award)
    
    return badges_to_award

def calculate_user_badges(user_id: str) -> List[UserBadge]:
    """Calculate and award badges for a user based on their activity."""
    # Get badge definitions
    badge_definitions = Badge.sql("SELECT * FROM badges WHERE category = 'user' AND is_active = true")
    badges_to_award = []
    
    for badge_def in badge_definitions:
        badge_type = badge_def["badge_type"]
        badge_id = badge_def["id"]
        
        # Check if badge already awarded
        existing = UserBadge.sql(
            "SELECT * FROM user_badges WHERE user_id = %(user_id)s AND badge_id = %(badge_id)s",
            {"user_id": user_id, "badge_id": badge_id}
        )
        
        if existing:
            continue  # Skip already awarded badges
            
        # Check each badge type's criteria
        if badge_type == "newcomer":
            # Newcomer: First registered user - always award for new users
            badges_to_award.append(_create_user_badge(user_id, badge_id))
                
        elif badge_type == "project_creator":
            # Project Creator: Created first project
            project_count = _count_user_projects(user_id)
            
            if project_count >= 1:
                badges_to_award.append(_create_user_badge(user_id, badge_id, context_value=project_count))
                
        elif badge_type == "prolific_creator":
            # Prolific Creator: Created 5+ projects
            project_count = _count_user_projects(user_id)
            
            if project_count >= 5:
                badges_to_award.append(_create_user_badge(user_id, badge_id, context_value=project_count))
                
        elif badge_type == "master_builder":
            # Master Builder: Created 10+ projects
            project_count = _count_user_projects(user_id)
            
            if project_count >= 10:
                badges_to_award.append(_create_user_badge(user_id, badge_id, context_value=project_count))
                
        elif badge_type == "supporter":
            # Supporter: Voted on 10+ projects
            vote_count = _count_user_votes(user_id)
            
            if vote_count >= 10:
                badges_to_award.append(_create_user_badge(user_id, badge_id, context_value=vote_count))
                
        elif badge_type == "champion":
            # Champion: Voted on 50+ projects
            vote_count = _count_user_votes(user_id)
            
            if vote_count >= 50:
                badges_to_award.append(_create_user_badge(user_id, badge_id, context_value=vote_count))
                
        elif badge_type == "contributor":
            # Contributor: First donation made
            donation_count = _count_user_donations(user_id)
            
            if donation_count >= 1:
                badges_to_award.append(_create_user_badge(user_id, badge_id, context_value=donation_count))
                
        elif badge_type == "patron":
            # Patron: Donated to 10+ projects
            donation_count = _count_user_donations(user_id)
            
            if donation_count >= 10:
                badges_to_award.append(_create_user_badge(user_id, badge_id, context_value=donation_count))
                
        elif badge_type == "benefactor":
            # Benefactor: Total donations exceed 1000 units
            donation_amount = _get_user_donation_total(user_id)
            
            if donation_amount >= 1000:
                badges_to_award.append(_create_user_badge(user_id, badge_id, context_value=int(donation_amount)))
                
        elif badge_type == "engaged_citizen":
            # Engaged Citizen: Commented on 20+ projects
            comment_count = _count_user_comments(user_id)
            
            if comment_count >= 20:
                badges_to_award.append(_create_user_badge(user_id, badge_id, context_value=comment_count))
                
        elif badge_type == "community_leader":
            # Community Leader: Combination of 5+ projects, 50+ votes, and donations
            project_count = _count_user_projects(user_id)
            vote_count = _count_user_votes(user_id)
            donation_count = _count_user_donations(user_id)
            
            if project_count >= 5 and vote_count >= 50 and donation_count >= 1:
                badge = _create_user_badge(user_id, badge_id)
                badge.context_value = project_count  # Store projects as context
                badges_to_award.append(badge)
    
    # Save all new badges
    if badges_to_award:
        UserBadge.sync_many(badges_to_award)
        
        # Update the user's badge count
        total_badges = len(UserBadge.sql("SELECT id FROM user_badges WHERE user_id = %(user_id)s", {"user_id": user_id}))
        User.sql("UPDATE users SET badge_count = %(count)s WHERE id = %(user_id)s", 
                {"user_id": user_id, "count": total_badges})
    
    return badges_to_award

@public
def recalculate_badges() -> Dict:
    """Recalculate all badges for all users and projects (admin function)."""
    # Get all users
    users = User.sql("SELECT id FROM users")
    
    # Get all projects
    projects = Project.sql("SELECT id FROM projects")
    
    user_badges = []
    for user in users:
        user_badges.extend(calculate_user_badges(user["id"]))
    
    project_badges = []
    for project in projects:
        project_badges.extend(calculate_project_badges(project["id"]))
    
    return {
        "user_badges_awarded": len(user_badges),
        "project_badges_awarded": len(project_badges)
    }

# ==================== Badge Event Triggers ====================

def check_badges_after_vote(project_id: uuid.UUID, user_id: str) -> Dict:
    """Check and award badges after a vote is cast."""
    project_badges = calculate_project_badges(project_id)
    user_badges = calculate_user_badges(user_id)
    
    return {
        "project_badges": [b.id for b in project_badges],
        "user_badges": [b.id for b in user_badges]
    }

def check_badges_after_donation(project_id: uuid.UUID, user_id: str) -> Dict:
    """Check and award badges after a donation is made."""
    project_badges = calculate_project_badges(project_id)
    user_badges = calculate_user_badges(user_id)
    
    return {
        "project_badges": [b.id for b in project_badges],
        "user_badges": [b.id for b in user_badges]
    }

def check_badges_after_comment(project_id: uuid.UUID, user_id: str) -> Dict:
    """Check and award badges after a comment is posted."""
    project_badges = calculate_project_badges(project_id)
    user_badges = calculate_user_badges(user_id)
    
    return {
        "project_badges": [b.id for b in project_badges],
        "user_badges": [b.id for b in user_badges]
    }

def check_badges_after_project_creation(project_id: uuid.UUID, user_id: str) -> Dict:
    """Check and award badges after a project is created."""
    user_badges = calculate_user_badges(user_id)
    
    return {
        "project_badges": [],
        "user_badges": [b.id for b in user_badges]
    }

# ==================== Helper Functions ====================

def _create_project_badge(project_id: uuid.UUID, badge_id: uuid.UUID, earned_value: Optional[int] = None) -> ProjectBadge:
    """Create a new project badge."""
    return ProjectBadge(
        project_id=project_id,
        badge_id=badge_id,
        earned_at=datetime.now(),
        earned_value=earned_value,
        is_active=True,
        is_featured=False
    )

def _create_user_badge(user_id: str, badge_id: uuid.UUID, context_project_id: Optional[uuid.UUID] = None, 
                      context_value: Optional[int] = None) -> UserBadge:
    """Create a new user badge."""
    return UserBadge(
        user_id=user_id,
        badge_id=badge_id,
        earned_at=datetime.now(),
        context_project_id=context_project_id,
        context_value=context_value,
        is_featured=False
    )

def _count_votes(project_id: uuid.UUID) -> int:
    """Count total votes for a project."""
    results = Vote.sql(
        "SELECT COUNT(*) as count FROM votes WHERE project_id = %(project_id)s",
        {"project_id": project_id}
    )
    return results[0]["count"] if results else 0

def _count_votes_in_timeframe(project_id: uuid.UUID, start_time: datetime, end_time: datetime) -> int:
    """Count votes for a project within a specific timeframe."""
    results = Vote.sql(
        """
        SELECT COUNT(*) as count FROM votes 
        WHERE project_id = %(project_id)s 
        AND created_at >= %(start_time)s 
        AND created_at <= %(end_time)s
        """,
        {"project_id": project_id, "start_time": start_time, "end_time": end_time}
    )
    return results[0]["count"] if results else 0

def _get_donation_total(project_id: uuid.UUID) -> float:
    """Get total donation amount for a project."""
    results = Donation.sql(
        "SELECT SUM(amount) as total FROM donations WHERE project_id = %(project_id)s",
        {"project_id": project_id}
    )
    return float(results[0]["total"]) if results and results[0]["total"] else 0.0

def _count_comments(project_id: uuid.UUID) -> int:
    """Count comments related to a project."""
    results = Comment.sql(
        """
        SELECT COUNT(*) as count FROM comments c
        JOIN timeline_items ti ON c.timeline_item_id = ti.id
        WHERE ti.project_id = %(project_id)s
        """,
        {"project_id": project_id}
    )
    return results[0]["count"] if results else 0

def _count_user_projects(user_id: str) -> int:
    """Count projects created by a user."""
    results = Project.sql(
        "SELECT COUNT(*) as count FROM projects WHERE user_id = %(user_id)s",
        {"user_id": user_id}
    )
    return results[0]["count"] if results else 0

def _count_user_votes(user_id: str) -> int:
    """Count projects voted on by a user."""
    results = Vote.sql(
        """
        SELECT COUNT(DISTINCT project_id) as count FROM votes 
        WHERE user_id = %(user_id)s
        """,
        {"user_id": user_id}
    )
    return results[0]["count"] if results else 0

def _count_user_donations(user_id: str) -> int:
    """Count projects donated to by a user."""
    results = Donation.sql(
        """
        SELECT COUNT(DISTINCT project_id) as count FROM donations 
        WHERE user_id = %(user_id)s
        """,
        {"user_id": user_id}
    )
    return results[0]["count"] if results else 0

def _get_user_donation_total(user_id: str) -> float:
    """Get total donation amount from a user."""
    results = Donation.sql(
        "SELECT SUM(amount) as total FROM donations WHERE user_id = %(user_id)s",
        {"user_id": user_id}
    )
    return float(results[0]["total"]) if results and results[0]["total"] else 0.0

def _count_user_comments(user_id: str) -> int:
    """Count projects commented on by a user."""
    results = Comment.sql(
        """
        SELECT COUNT(DISTINCT ti.project_id) as count 
        FROM comments c
        JOIN timeline_items ti ON c.timeline_item_id = ti.id
        WHERE c.user_id = %(user_id)s
        """,
        {"user_id": user_id}
    )
    return results[0]["count"] if results else 0