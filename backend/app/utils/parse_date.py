from datetime import datetime
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def parse_date(date_str: Optional[str], format: str = "%Y-%m-%d") -> Optional[datetime]:
    """
    Parse date string to datetime object
    
    Args:
        date_str: Date string to parse (e.g., "2025-01-15", "2025-01-15T10:30:00Z")
        format: Expected date format (default: "%Y-%m-%d")
    
    Returns:
        datetime object or None if parsing fails
    """
    if not date_str:
        return None
    
    try:
        # Handle ISO format with timezone
        if "T" in str(date_str):
            # Remove timezone info if present
            date_str = str(date_str).split("T")[0]
            return datetime.strptime(date_str, "%Y-%m-%d")
        
        return datetime.strptime(str(date_str), format)
    except ValueError as e:
        logger.error(f"[v0] Error parsing date '{date_str}': {str(e)}")
        return None


def format_date(date_obj: Optional[datetime], format: str = "%d %b %Y") -> str:
    """
    Format datetime object to string
    
    Args:
        date_obj: datetime object to format
        format: Desired output format (default: "15 Jan 2025")
    
    Returns:
        Formatted date string or empty string if None
    """
    if not date_obj:
        return ""
    
    try:
        if isinstance(date_obj, str):
            date_obj = parse_date(date_obj)
        
        return date_obj.strftime(format) if date_obj else ""
    except Exception as e:
        logger.error(f"[v0] Error formatting date: {str(e)}")
        return ""


def get_days_between(start_date: Optional[datetime], end_date: Optional[datetime]) -> int:
    """
    Calculate days between two dates
    
    Args:
        start_date: Start datetime
        end_date: End datetime
    
    Returns:
        Number of days between dates
    """
    if not start_date or not end_date:
        return 0
    
    try:
        delta = end_date - start_date
        return delta.days
    except Exception as e:
        logger.error(f"[v0] Error calculating days between dates: {str(e)}")
        return 0


def is_overdue(due_date: Optional[datetime], reference_date: Optional[datetime] = None) -> bool:
    """
    Check if date is overdue
    
    Args:
        due_date: Due datetime
        reference_date: Reference date to check against (default: today)
    
    Returns:
        True if overdue, False otherwise
    """
    if not due_date:
        return False
    
    if reference_date is None:
        reference_date = datetime.now()
    
    return due_date < reference_date
