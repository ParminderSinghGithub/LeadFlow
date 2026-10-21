from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import Lead, Discussion
from app.schemas import (
    LeadCreate,
    LeadDetail,
    LeadListItem,
    LeadRead,
    LeadStatus,
    LeadStatusUpdate,
    DiscussionCreate,
    DiscussionRead,
)

router = APIRouter(prefix="/leads", tags=["Leads"])


@router.get("", response_model=List[LeadListItem])
def list_leads(
    status: Optional[LeadStatus] = Query(None, description="Filter by lead status"),
    search: Optional[str] = Query(None, description="Case-insensitive search by lead name"),
    db: Session = Depends(get_db),
) -> List[LeadListItem]:
    """
    List all leads with optional status filter and name search.
    Includes the latest discussion note and its timestamp without N+1 queries.
    """
    query = db.query(Lead).options(selectinload(Lead.discussions))

    if status is not None:
        query = query.filter(Lead.status == status.value)

    if search is not None:
        trimmed_search = search.strip()
        if trimmed_search:
            query = query.filter(Lead.name.ilike(f"%{trimmed_search}%"))

    query = query.order_by(desc(Lead.created_at), desc(Lead.id))
    leads = query.all()

    items = []
    for lead in leads:
        latest_discussion = lead.discussions[0] if lead.discussions else None
        items.append(
            LeadListItem(
                id=lead.id,
                name=lead.name,
                company=lead.company,
                phone=lead.phone,
                status=lead.status,
                next_follow_up_at=lead.next_follow_up_at,
                created_at=lead.created_at,
                updated_at=lead.updated_at,
                last_discussion_note=latest_discussion.note if latest_discussion else None,
                last_discussion_at=latest_discussion.created_at if latest_discussion else None,
            )
        )
    return items


@router.post("", response_model=LeadRead, status_code=status.HTTP_201_CREATED)
def create_lead(
    payload: LeadCreate,
    db: Session = Depends(get_db),
) -> Lead:
    """
    Create a new lead with status 'New'.
    """
    now = datetime.now(timezone.utc)
    lead = Lead(
        name=payload.name,
        company=payload.company,
        phone=payload.phone,
        status=LeadStatus.NEW.value,
        created_at=now,
        updated_at=now,
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


@router.get("/{lead_id}", response_model=LeadDetail)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
) -> LeadDetail:
    """
    Retrieve a lead and its complete discussion history in reverse chronological order.
    """
    lead = (
        db.query(Lead)
        .options(selectinload(Lead.discussions))
        .filter(Lead.id == lead_id)
        .first()
    )
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID {lead_id} not found",
        )

    return LeadDetail(
        id=lead.id,
        name=lead.name,
        company=lead.company,
        phone=lead.phone,
        status=lead.status,
        next_follow_up_at=lead.next_follow_up_at,
        created_at=lead.created_at,
        updated_at=lead.updated_at,
        discussions=[DiscussionRead.model_validate(d) for d in lead.discussions],
    )


@router.patch("/{lead_id}/status", response_model=LeadRead)
def update_lead_status(
    lead_id: int,
    payload: LeadStatusUpdate,
    db: Session = Depends(get_db),
) -> Lead:
    """
    Update a lead's status and refresh updated_at timestamp.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID {lead_id} not found",
        )

    lead.status = payload.status.value
    lead.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(lead)
    return lead


@router.post(
    "/{lead_id}/discussions",
    response_model=DiscussionRead,
    status_code=status.HTTP_201_CREATED,
)
def add_discussion(
    lead_id: int,
    payload: DiscussionCreate,
    db: Session = Depends(get_db),
) -> Discussion:
    """
    Add a discussion to a lead.
    If follow_up_at is provided, atomatically updates lead.next_follow_up_at in the same transaction.
    If follow_up_at is omitted, existing lead.next_follow_up_at is preserved.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID {lead_id} not found",
        )

    now = datetime.now(timezone.utc)
    discussion = Discussion(
        lead_id=lead.id,
        note=payload.note,
        follow_up_at=payload.follow_up_at,
        created_at=now,
    )
    db.add(discussion)

    if payload.follow_up_at is not None:
        lead.next_follow_up_at = payload.follow_up_at
        lead.updated_at = now

    try:
        db.commit()
        db.refresh(discussion)
    except Exception:
        db.rollback()
        raise

    return discussion
