from typing import List, Optional
from uuid import UUID
from datetime import datetime
from solar.access import User, authenticated, public
from core.comment import Comment
from core.project import Project
from core.timeline_item import TimelineItem
from core.badge_service import check_badges_after_comment

@public
def get_project_comments(project_id: UUID) -> List[Comment]:
    """Get all comments for a project, ordered by creation date."""
    results = Comment.sql("""
        SELECT * FROM comments 
        WHERE project_id = %(project_id)s 
        ORDER BY created_at ASC
    """, {"project_id": project_id})
    
    return [Comment(**result) for result in results]

@public
def get_timeline_item_comments(timeline_item_id: UUID) -> List[Comment]:
    """Get comments for a specific timeline item."""
    results = Comment.sql("""
        SELECT * FROM comments 
        WHERE timeline_item_id = %(timeline_item_id)s 
        ORDER BY created_at ASC
    """, {"timeline_item_id": timeline_item_id})
    
    return [Comment(**result) for result in results]

@public
def get_threaded_comments(project_id: UUID, timeline_item_id: Optional[UUID] = None) -> List[Comment]:
    """Get threaded comments for a project or timeline item."""
    if timeline_item_id:
        results = Comment.sql("""
            SELECT * FROM comments 
            WHERE timeline_item_id = %(timeline_item_id)s 
            ORDER BY created_at ASC
        """, {"timeline_item_id": timeline_item_id})
    else:
        results = Comment.sql("""
            SELECT * FROM comments 
            WHERE project_id = %(project_id)s AND timeline_item_id IS NULL
            ORDER BY created_at ASC
        """, {"project_id": project_id})
    
    return [Comment(**result) for result in results]

@authenticated
def create_comment(user: User, project_id: UUID, content: str, 
                  timeline_item_id: Optional[UUID] = None,
                  parent_comment_id: Optional[UUID] = None) -> Comment:
    """Create a new comment on a project or timeline item."""
    # Validate project exists
    project_exists = Project.sql("SELECT id FROM projects WHERE id = %(project_id)s", {"project_id": project_id})
    if not project_exists:
        raise ValueError("Project not found")
    
    # Validate timeline item if provided
    if timeline_item_id:
        timeline_exists = TimelineItem.sql("""
            SELECT id FROM timeline_items 
            WHERE id = %(timeline_item_id)s AND project_id = %(project_id)s
        """, {"timeline_item_id": timeline_item_id, "project_id": project_id})
        if not timeline_exists:
            raise ValueError("Timeline item not found for this project")
    
    # Validate parent comment if provided
    if parent_comment_id:
        parent_exists = Comment.sql("""
            SELECT id FROM comments 
            WHERE id = %(parent_comment_id)s AND project_id = %(project_id)s
        """, {"parent_comment_id": parent_comment_id, "project_id": project_id})
        if not parent_exists:
            raise ValueError("Parent comment not found for this project")
    
    comment = Comment(
        user_id=user.id,
        project_id=project_id,
        timeline_item_id=timeline_item_id,
        parent_comment_id=parent_comment_id,
        content=content
    )
    comment.sync()
    
    # Check and award badges after commenting
    check_badges_after_comment(project_id, user.id)
    
    return comment

@authenticated
def update_comment(user: User, comment_id: UUID, content: str) -> Optional[Comment]:
    """Update a comment (only by the comment author)."""
    comment_results = Comment.sql("SELECT * FROM comments WHERE id = %(comment_id)s", {"comment_id": comment_id})
    if not comment_results:
        return None
    
    comment = Comment(**comment_results[0])
    
    # Check if user owns the comment
    if comment.user_id != user.id:
        return None
    
    comment.content = content
    comment.updated_at = datetime.now()
    comment.sync()
    return comment

@authenticated
def delete_comment(user: User, comment_id: UUID) -> bool:
    """Delete a comment (only by the comment author or project owner)."""
    comment_results = Comment.sql("""
        SELECT c.*, p.user_id as project_owner_id
        FROM comments c
        JOIN projects p ON c.project_id = p.id
        WHERE c.id = %(comment_id)s
    """, {"comment_id": comment_id})
    
    if not comment_results:
        return False
    
    comment_data = comment_results[0]
    
    # Check if user owns the comment or the project
    if comment_data["user_id"] != user.id and comment_data["project_owner_id"] != user.id:
        return False
    
    # Delete child comments first (if any)
    Comment.sql("DELETE FROM comments WHERE parent_comment_id = %(comment_id)s", {"comment_id": comment_id})
    
    # Delete the comment
    Comment.sql("DELETE FROM comments WHERE id = %(comment_id)s", {"comment_id": comment_id})
    return True

@public
def get_recent_comments(limit: int = 20) -> List[Comment]:
    """Get recent comments across all projects."""
    results = Comment.sql("""
        SELECT * FROM comments 
        ORDER BY created_at DESC 
        LIMIT %(limit)s
    """, {"limit": limit})
    
    return [Comment(**result) for result in results]

@public
def get_comment_count_for_project(project_id: UUID) -> int:
    """Get total comment count for a project."""
    result = Comment.sql("""
        SELECT COUNT(*) as count FROM comments WHERE project_id = %(project_id)s
    """, {"project_id": project_id})
    
    return result[0]["count"] if result else 0

@authenticated
def get_user_comments(user: User) -> List[Comment]:
    """Get all comments made by a user."""
    results = Comment.sql("""
        SELECT * FROM comments 
        WHERE user_id = %(user_id)s 
        ORDER BY created_at DESC
    """, {"user_id": user.id})
    
    return [Comment(**result) for result in results]

@public
def search_comments(query: str, project_id: Optional[UUID] = None) -> List[Comment]:
    """Search comments by content."""
    if project_id:
        results = Comment.sql("""
            SELECT * FROM comments 
            WHERE project_id = %(project_id)s 
            AND LOWER(content) LIKE LOWER(%(query)s)
            ORDER BY created_at DESC
        """, {"project_id": project_id, "query": f"%{query}%"})
    else:
        results = Comment.sql("""
            SELECT * FROM comments 
            WHERE LOWER(content) LIKE LOWER(%(query)s)
            ORDER BY created_at DESC
        """, {"query": f"%{query}%"})
    
    return [Comment(**result) for result in results]