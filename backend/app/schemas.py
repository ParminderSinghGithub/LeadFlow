from datetime import datetime
from enum import Enum
from typing import Optional
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


class DiscussionBase(BaseModel):
    note: str = Field(..., min_length=1, description="Discussion note cannot be empty")
    follow_up_at: Optional[datetime] = None

    @field_validator("note")
    @classmethod
    def note_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Note cannot be empty or blank")
        return v


class DiscussionRead(DiscussionBase):
    id: int
    lead_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class LeadBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Lead name cannot be empty")
    company: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    status: LeadStatus = LeadStatus.NEW
    next_follow_up_at: Optional[datetime] = None

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be empty or blank")
        return v.strip()


class LeadRead(LeadBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
