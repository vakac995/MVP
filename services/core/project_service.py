from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from solar.access import User, authenticated, public
from core.project import Project
from core.timeline_item import TimelineItem
from core.vote import Vote
from core.donation import Donation
from core.comment import Comment
from core.badge_service import check_badges_after_project_creation

@public
def get_all_projects() -> List[Project]:
    """Get all projects for public viewing."""
    results = Project.sql("SELECT * FROM projects ORDER BY created_at DESC")
    return [Project(**result) for result in results]

@public
def get_project_by_id(project_id: UUID) -> Optional[Project]:
    """Get a specific project by ID."""
    results = Project.sql("SELECT * FROM projects WHERE id = %(project_id)s", {"project_id": project_id})
    if results:
        return Project(**results[0])
    return None

@public
def get_featured_projects(limit: int = 5) -> List[Project]:
    """Get featured projects based on vote count and recent activity."""
    results = Project.sql("""
        SELECT * FROM projects 
        ORDER BY vote_count DESC, created_at DESC 
        LIMIT %(limit)s
    """, {"limit": limit})
    return [Project(**result) for result in results]

@public
def search_projects(query: str) -> List[Project]:
    """Search projects by title, description, or tags."""
    results = Project.sql("""
        SELECT * FROM projects 
        WHERE LOWER(title) LIKE LOWER(%(query)s) 
        OR LOWER(description) LIKE LOWER(%(query)s)
        OR %(query_lower)s = ANY(SELECT LOWER(unnest(tags)))
        ORDER BY vote_count DESC, created_at DESC
    """, {"query": f"%{query}%", "query_lower": query.lower()})
    return [Project(**result) for result in results]

@public
def get_projects_by_category(category: str) -> List[Project]:
    """Get projects filtered by category."""
    results = Project.sql("SELECT * FROM projects WHERE category = %(category)s ORDER BY created_at DESC", {"category": category})
    return [Project(**result) for result in results]

@authenticated
def create_project(user: User, title: str, description: str, budget: float, category: str, tags: List[str] = None) -> Project:
    """Create a new project."""
    if tags is None:
        tags = []
    
    project = Project(
        user_id=user.id,
        title=title,
        description=description,
        status="planning",
        budget=budget,
        category=category,
        tags=tags
    )
    project.sync()
    
    # Check and award badges after project creation
    check_badges_after_project_creation(project.id, user.id)
    
    return project

@authenticated
def update_project(user: User, project_id: UUID, title: str = None, description: str = None, 
                  budget: float = None, status: str = None, category: str = None, 
                  tags: List[str] = None) -> Optional[Project]:
    """Update an existing project (only by owner)."""
    project_results = Project.sql("SELECT * FROM projects WHERE id = %(project_id)s", {"project_id": project_id})
    if not project_results:
        return None
    
    project = Project(**project_results[0])
    
    # Check if user owns the project
    if project.user_id != user.id:
        return None
    
    # Update fields if provided
    if title is not None:
        project.title = title
    if description is not None:
        project.description = description
    if budget is not None:
        project.budget = budget
    if status is not None:
        project.status = status
    if category is not None:
        project.category = category
    if tags is not None:
        project.tags = tags
    
    project.updated_at = datetime.now()
    project.sync()
    return project

@authenticated
def delete_project(user: User, project_id: UUID) -> bool:
    """Delete a project (only by owner)."""
    project_results = Project.sql("SELECT * FROM projects WHERE id = %(project_id)s", {"project_id": project_id})
    if not project_results:
        return False
    
    project = Project(**project_results[0])
    
    # Check if user owns the project
    if project.user_id != user.id:
        return False
    
    # Delete related data first
    Vote.sql("DELETE FROM votes WHERE project_id = %(project_id)s", {"project_id": project_id})
    Donation.sql("DELETE FROM donations WHERE project_id = %(project_id)s", {"project_id": project_id})
    Comment.sql("DELETE FROM comments WHERE project_id = %(project_id)s", {"project_id": project_id})
    TimelineItem.sql("DELETE FROM timeline_items WHERE project_id = %(project_id)s", {"project_id": project_id})
    
    # Delete the project
    Project.sql("DELETE FROM projects WHERE id = %(project_id)s", {"project_id": project_id})
    return True

@public
def get_project_statistics(project_id: UUID) -> Dict[str, Any]:
    """Get statistics for a project including votes, donations, comments."""
    project_results = Project.sql("SELECT * FROM projects WHERE id = %(project_id)s", {"project_id": project_id})
    if not project_results:
        return {}
    
    project = Project(**project_results[0])
    
    vote_count = Vote.sql("SELECT COUNT(*) as count FROM votes WHERE project_id = %(project_id)s", {"project_id": project_id})[0]["count"]
    
    donation_stats = Donation.sql("""
        SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total 
        FROM donations WHERE project_id = %(project_id)s
    """, {"project_id": project_id})[0]
    
    comment_count = Comment.sql("SELECT COUNT(*) as count FROM comments WHERE project_id = %(project_id)s", {"project_id": project_id})[0]["count"]
    
    return {
        "vote_count": vote_count,
        "donation_count": donation_stats["count"],
        "donation_total": float(donation_stats["total"]),
        "comment_count": comment_count,
        "funding_percentage": (float(donation_stats["total"]) / project.budget * 100) if project.budget > 0 else 0
    }