from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    CheckConstraint,
    func,
)
from sqlalchemy.orm import relationship
from app.database import Base

ALLOWED_STATUSES = (
    "New",
    "Contacted",
    "Qualified",
    "Proposal Sent",
    "Won",
    "Lost",
)


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    status = Column(String(50), nullable=False, default="New", server_default="New", index=True)
    next_follow_up_at = Column(DateTime(timezone=True), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    discussions = relationship(
        "Discussion",
        back_populates="lead",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="desc(Discussion.created_at), desc(Discussion.id)",
    )

    __table_args__ = (
        CheckConstraint(
            f"status IN {ALLOWED_STATUSES}",
            name="ck_leads_status",
        ),
        CheckConstraint("length(trim(name)) > 0", name="ck_leads_name_non_empty"),
    )


class Discussion(Base):
    __tablename__ = "discussions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    lead_id = Column(
        Integer,
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    note = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    follow_up_at = Column(DateTime(timezone=True), nullable=True)

    lead = relationship("Lead", back_populates="discussions")

    __table_args__ = (
        CheckConstraint("length(trim(note)) > 0", name="ck_discussions_note_non_empty"),
    )
