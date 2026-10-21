import pytest
from pydantic import ValidationError
from app.models import ALLOWED_STATUSES, Lead, Discussion
from app.schemas import LeadBase, LeadStatus, DiscussionBase


def test_allowed_statuses_exact_values():
    """Verify exact spelling of required lead statuses."""
    expected = ("New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost")
    assert ALLOWED_STATUSES == expected
    assert [s.value for s in LeadStatus] == list(expected)


def test_lead_schema_validation_success():
    """Test valid lead schema creation."""
    lead = LeadBase(
        name="Alice Johnson",
        company="Acme Corp",
        phone="+1234567890",
        status=LeadStatus.NEW,
    )
    assert lead.name == "Alice Johnson"
    assert lead.status == "New"


def test_lead_schema_rejects_empty_name():
    """Test lead schema rejects empty or whitespace name."""
    with pytest.raises(ValidationError):
        LeadBase(name="   ", status=LeadStatus.NEW)


def test_lead_schema_rejects_invalid_status():
    """Test lead schema rejects statuses outside allowed list."""
    with pytest.raises(ValidationError):
        LeadBase(name="Valid Name", status="InvalidStatus")


def test_discussion_schema_rejects_empty_note():
    """Test discussion schema rejects empty or whitespace note."""
    with pytest.raises(ValidationError):
        DiscussionBase(note="   ")
