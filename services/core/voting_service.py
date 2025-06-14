from typing import List, Optional
from uuid import UUID
from solar.access import User, authenticated, public
from core.vote import Vote
from core.project import Project
from core.badge_service import check_badges_after_vote

@authenticated
def vote_for_project(user: User, project_id: UUID) -> bool:
    """Vote for a project (one vote per user per project)."""
    # Check if user already voted for this project
    existing_vote = Vote.sql("""
        SELECT * FROM votes 
        WHERE user_id = %(user_id)s AND project_id = %(project_id)s
    """, {"user_id": user.id, "project_id": project_id})
    
    if existing_vote:
        return False  # User already voted
    
    # Check if project exists
    project_exists = Project.sql("SELECT id FROM projects WHERE id = %(project_id)s", {"project_id": project_id})
    if not project_exists:
        return False
    
    # Create vote
    vote = Vote(user_id=user.id, project_id=project_id)
    vote.sync()
    
    # Update project vote count
    Project.sql("""
        UPDATE projects 
        SET vote_count = vote_count + 1 
        WHERE id = %(project_id)s
    """, {"project_id": project_id})
    
    # Check and award badges after voting
    check_badges_after_vote(project_id, user.id)
    
    return True

@authenticated
def remove_vote_for_project(user: User, project_id: UUID) -> bool:
    """Remove vote for a project."""
    # Check if user voted for this project
    existing_vote = Vote.sql("""
        SELECT * FROM votes 
        WHERE user_id = %(user_id)s AND project_id = %(project_id)s
    """, {"user_id": user.id, "project_id": project_id})
    
    if not existing_vote:
        return False  # User hasn't voted
    
    # Remove vote
    Vote.sql("""
        DELETE FROM votes 
        WHERE user_id = %(user_id)s AND project_id = %(project_id)s
    """, {"user_id": user.id, "project_id": project_id})
    
    # Update project vote count
    Project.sql("""
        UPDATE projects 
        SET vote_count = vote_count - 1 
        WHERE id = %(project_id)s
    """, {"project_id": project_id})
    
    return True

@authenticated
def has_user_voted(user: User, project_id: UUID) -> bool:
    """Check if user has voted for a specific project."""
    existing_vote = Vote.sql("""
        SELECT id FROM votes 
        WHERE user_id = %(user_id)s AND project_id = %(project_id)s
    """, {"user_id": user.id, "project_id": project_id})
    
    return len(existing_vote) > 0

@public
def get_project_vote_count(project_id: UUID) -> int:
    """Get the total vote count for a project."""
    result = Vote.sql("""
        SELECT COUNT(*) as count FROM votes WHERE project_id = %(project_id)s
    """, {"project_id": project_id})
    
    return result[0]["count"] if result else 0

@authenticated
def get_user_votes(user: User) -> List[Vote]:
    """Get all votes by a user."""
    results = Vote.sql("""
        SELECT * FROM votes WHERE user_id = %(user_id)s ORDER BY created_at DESC
    """, {"user_id": user.id})
    
    return [Vote(**result) for result in results]

@public
def get_project_voters(project_id: UUID, limit: int = 10) -> List[Vote]:
    """Get recent voters for a project (for displaying)."""
    results = Vote.sql("""
        SELECT * FROM votes 
        WHERE project_id = %(project_id)s 
        ORDER BY created_at DESC 
        LIMIT %(limit)s
    """, {"project_id": project_id, "limit": limit})
    
    return [Vote(**result) for result in results]