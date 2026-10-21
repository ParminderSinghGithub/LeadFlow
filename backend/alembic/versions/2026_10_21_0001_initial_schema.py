"""initial schema for leads and discussions

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-10-21 18:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "leads",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("company", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("status", sa.String(length=50), server_default="New", nullable=False),
        sa.Column("next_follow_up_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "status IN ('New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost')",
            name="ck_leads_status",
        ),
        sa.CheckConstraint("length(trim(name)) > 0", name="ck_leads_name_non_empty"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_leads_id", "leads", ["id"], unique=False)
    op.create_index("ix_leads_status", "leads", ["status"], unique=False)
    op.create_index("ix_leads_next_follow_up_at", "leads", ["next_follow_up_at"], unique=False)
    op.create_index("ix_leads_created_at", "leads", ["created_at"], unique=False)

    op.create_table(
        "discussions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("lead_id", sa.Integer(), nullable=False),
        sa.Column("note", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("follow_up_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("length(trim(note)) > 0", name="ck_discussions_note_non_empty"),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_discussions_id", "discussions", ["id"], unique=False)
    op.create_index("ix_discussions_lead_id", "discussions", ["lead_id"], unique=False)
    op.create_index("ix_discussions_created_at", "discussions", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_discussions_created_at", table_name="discussions")
    op.drop_index("ix_discussions_lead_id", table_name="discussions")
    op.drop_index("ix_discussions_id", table_name="discussions")
    op.drop_table("discussions")

    op.drop_index("ix_leads_created_at", table_name="leads")
    op.drop_index("ix_leads_next_follow_up_at", table_name="leads")
    op.drop_index("ix_leads_status", table_name="leads")
    op.drop_index("ix_leads_id", table_name="leads")
    op.drop_table("leads")
