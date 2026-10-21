from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class LeadStatus(str, Enum):
    NEW = "New"
    CONTACTED = "Contacted"
    QUALIFIED = "Qualified"
    PROPOSAL_SENT = "Proposal Sent"
    WON = "Won"
    LOST = "Lost"


class HealthResponse(BaseModel):
    status: str = "ok"


class DiscussionCreate(BaseModel):
    note: str = Field(..., description="Discussion note cannot be empty")
    follow_up_at: Optional[datetime] = None

    @field_validator("note")
    @classmethod
    def note_must_not_be_blank(cls, v: str) -> str:
        trimmed = v.strip() if v else ""
        if not trimmed:
            raise ValueError("Note cannot be empty or whitespace only")
        return trimmed

    @field_validator("follow_up_at")
    @classmethod
    def follow_up_at_must_be_timezone_aware(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is not None and (v.tzinfo is None or v.tzinfo.utcoffset(v) is None):
            raise ValueError(
                "follow_up_at must be a timezone-aware datetime (e.g., ISO 8601 with 'Z' or timezone offset)"
            )
        return v


class DiscussionBase(DiscussionCreate):
    pass


class DiscussionRead(BaseModel):
    id: int
    lead_id: int
    note: str
    created_at: datetime
    follow_up_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class LeadCreate(BaseModel):
    name: str = Field(..., max_length=255, description="Lead name cannot be empty")
    company: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, v: str) -> str:
        trimmed = v.strip() if v else ""
        if not trimmed:
            raise ValueError("Name cannot be empty or whitespace only")
        return trimmed

    @field_validator("company", "phone")
    @classmethod
    def trim_optional_fields(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            trimmed = v.strip()
            return trimmed if trimmed else None
        return None


class LeadBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Lead name cannot be empty")
    company: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    status: LeadStatus = LeadStatus.NEW
    next_follow_up_at: Optional[datetime] = None

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, v: str) -> str:
        trimmed = v.strip() if v else ""
        if not trimmed:
            raise ValueError("Name cannot be empty or whitespace only")
        return trimmed


class LeadStatusUpdate(BaseModel):
    status: LeadStatus


class LeadRead(BaseModel):
    id: int
    name: str
    company: Optional[str] = None
    phone: Optional[str] = None
    status: LeadStatus
    next_follow_up_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LeadListItem(BaseModel):
    id: int
    name: str
    company: Optional[str] = None
    phone: Optional[str] = None
    status: LeadStatus
    next_follow_up_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    last_discussion_note: Optional[str] = None
    last_discussion_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class LeadDetail(BaseModel):
    id: int
    name: str
    company: Optional[str] = None
    phone: Optional[str] = None
    status: LeadStatus
    next_follow_up_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    discussions: List[DiscussionRead] = []

    model_config = {"from_attributes": True}
