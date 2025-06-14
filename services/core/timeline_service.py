from typing import List, Optional
from uuid import UUID
from datetime import datetime
from solar.access import User, authenticated, public
from core.timeline_item import TimelineItem
from core.project import Project

@public
def get_project_timeline(project_id: UUID) -> List[TimelineItem]:
    """Get timeline items for a project, ordered by order_index."""
    results = TimelineItem.sql("""
        SELECT * FROM timeline_items 
        WHERE project_id = %(project_id)s 
        ORDER BY order_index ASC, created_at ASC
    """, {"project_id": project_id})
    
    return [TimelineItem(**result) for result in results]

@authenticated
def create_timeline_item(user: User, project_id: UUID, title: str, description: str, 
                        milestone_type: str, target_date: Optional[datetime] = None,
                        order_index: Optional[int] = None) -> TimelineItem:
    """Create a new timeline item for a project."""
    # Verify user owns the project
    project_results = Project.sql("SELECT user_id FROM projects WHERE id = %(project_id)s", {"project_id": project_id})
    if not project_results or project_results[0]["user_id"] != user.id:
        raise ValueError("User does not own this project")
    
    # Auto-assign order_index if not provided
    if order_index is None:
        max_order_result = TimelineItem.sql("""
            SELECT COALESCE(MAX(order_index), 0) as max_order 
            FROM timeline_items 
            WHERE project_id = %(project_id)s
        """, {"project_id": project_id})
        order_index = max_order_result[0]["max_order"] + 1
    
    timeline_item = TimelineItem(
        project_id=project_id,
        user_id=user.id,
        title=title,
        description=description,
        milestone_type=milestone_type,
        target_date=target_date,
        order_index=order_index
    )
    timeline_item.sync()
    return timeline_item

@authenticated
def update_timeline_item(user: User, timeline_item_id: UUID, title: str = None, 
                        description: str = None, target_date: Optional[datetime] = None,
                        is_completed: bool = None) -> Optional[TimelineItem]:
    """Update a timeline item (only by project owner)."""
    timeline_results = TimelineItem.sql("""
        SELECT ti.*, p.user_id as project_owner_id
        FROM timeline_items ti
        JOIN projects p ON ti.project_id = p.id
        WHERE ti.id = %(timeline_item_id)s
    """, {"timeline_item_id": timeline_item_id})
    
    if not timeline_results:
        return None
    
    timeline_data = timeline_results[0]
    
    # Check if user owns the project
    if timeline_data["project_owner_id"] != user.id:
        return None
    
    timeline_item = TimelineItem(**{k: v for k, v in timeline_data.items() if k != "project_owner_id"})
    
    # Update fields if provided
    if title is not None:
        timeline_item.title = title
    if description is not None:
        timeline_item.description = description
    if target_date is not None:
        timeline_item.target_date = target_date
    if is_completed is not None:
        timeline_item.is_completed = is_completed
        if is_completed and timeline_item.completed_date is None:
            timeline_item.completed_date = datetime.now()
        elif not is_completed:
            timeline_item.completed_date = None
    
    timeline_item.sync()
    return timeline_item

@authenticated
def delete_timeline_item(user: User, timeline_item_id: UUID) -> bool:
    """Delete a timeline item (only by project owner)."""
    timeline_results = TimelineItem.sql("""
        SELECT ti.project_id, p.user_id as project_owner_id
        FROM timeline_items ti
        JOIN projects p ON ti.project_id = p.id
        WHERE ti.id = %(timeline_item_id)s
    """, {"timeline_item_id": timeline_item_id})
    
    if not timeline_results:
        return False
    
    timeline_data = timeline_results[0]
    
    # Check if user owns the project
    if timeline_data["project_owner_id"] != user.id:
        return False
    
    # Delete the timeline item
    TimelineItem.sql("DELETE FROM timeline_items WHERE id = %(timeline_item_id)s", {"timeline_item_id": timeline_item_id})
    return True

@authenticated
def reorder_timeline_items(user: User, project_id: UUID, item_order: List[UUID]) -> bool:
    """Reorder timeline items for a project."""
    # Verify user owns the project
    project_results = Project.sql("SELECT user_id FROM projects WHERE id = %(project_id)s", {"project_id": project_id})
    if not project_results or project_results[0]["user_id"] != user.id:
        return False
    
    # Update order_index for each item
    for index, item_id in enumerate(item_order):
        TimelineItem.sql("""
            UPDATE timeline_items 
            SET order_index = %(order_index)s 
            WHERE id = %(item_id)s AND project_id = %(project_id)s
        """, {"order_index": index + 1, "item_id": item_id, "project_id": project_id})
    
    return True

@public
def get_timeline_item_by_id(timeline_item_id: UUID) -> Optional[TimelineItem]:
    """Get a specific timeline item by ID."""
    results = TimelineItem.sql("SELECT * FROM timeline_items WHERE id = %(timeline_item_id)s", {"timeline_item_id": timeline_item_id})
    if results:
        return TimelineItem(**results[0])
    return None

@public
def get_recent_timeline_activity(limit: int = 20) -> List[TimelineItem]:
    """Get recent timeline activity across all projects."""
    results = TimelineItem.sql("""
        SELECT * FROM timeline_items 
        ORDER BY created_at DESC 
        LIMIT %(limit)s
    """, {"limit": limit})
    
    return [TimelineItem(**result) for result in results]