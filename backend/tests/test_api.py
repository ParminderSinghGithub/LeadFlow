from datetime import datetime, timezone, timedelta


def test_health_endpoint_still_passes(client):
    """1. Health endpoint still passes."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_lead_with_required_and_optional_fields(client):
    """3. Creating a lead with required and optional fields."""
    payload = {
        "name": "Jane Doe",
        "company": "Acme Inc.",
        "phone": "+1-555-0199",
    }
    response = client.post("/api/leads", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["name"] == "Jane Doe"
    assert data["company"] == "Acme Inc."
    assert data["phone"] == "+1-555-0199"
    assert data["status"] == "New"
    assert data["created_at"] is not None
    assert data["updated_at"] is not None
    assert data["next_follow_up_at"] is None


def test_create_lead_required_fields_only(client):
    """Creating a lead with only required name field."""
    payload = {"name": "Bob Smith"}
    response = client.post("/api/leads", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Bob Smith"
    assert data["company"] is None
    assert data["phone"] is None
    assert data["status"] == "New"


def test_reject_missing_blank_or_whitespace_lead_name(client):
    """4. Rejecting a missing, blank or whitespace-only lead name."""
    # Missing name
    res1 = client.post("/api/leads", json={"company": "Acme"})
    assert res1.status_code == 422

    # Empty string name
    res2 = client.post("/api/leads", json={"name": ""})
    assert res2.status_code == 422

    # Whitespace-only name
    res3 = client.post("/api/leads", json={"name": "   "})
    assert res3.status_code == 422


def test_list_leads_including_lead_without_discussions(client):
    """2. Listing leads, including a lead without discussions."""
    # Create two leads
    lead1 = client.post("/api/leads", json={"name": "Lead Without Discussion"}).json()
    lead2 = client.post("/api/leads", json={"name": "Lead With Discussion"}).json()

    # Add discussion to lead2
    client.post(
        f"/api/leads/{lead2['id']}/discussions",
        json={"note": "Initial discussion note"},
    )

    response = client.get("/api/leads")
    assert response.status_code == 200
    leads = response.json()
    assert len(leads) == 2

    # Find the leads in the response
    l1 = next(l for l in leads if l["id"] == lead1["id"])
    l2 = next(l for l in leads if l["id"] == lead2["id"])

    assert l1["last_discussion_note"] is None
    assert l1["last_discussion_at"] is None

    assert l2["last_discussion_note"] == "Initial discussion note"
    assert l2["last_discussion_at"] is not None


def test_filter_leads_by_status_and_search_by_name(client):
    """5. Filtering leads by status and searching by name."""
    l1 = client.post("/api/leads", json={"name": "Alice Cooper"}).json()
    l2 = client.post("/api/leads", json={"name": "Bob Marley"}).json()
    l3 = client.post("/api/leads", json={"name": "Charlie Chaplin"}).json()

    # Update l2 to Qualified
    client.patch(f"/api/leads/{l2['id']}/status", json={"status": "Qualified"})

    # Filter by status Qualified
    res_status = client.get("/api/leads?status=Qualified")
    assert res_status.status_code == 200
    qualified_leads = res_status.json()
    assert len(qualified_leads) == 1
    assert qualified_leads[0]["id"] == l2["id"]

    # Search by name (case-insensitive)
    res_search = client.get("/api/leads?search=mArLeY")
    assert res_search.status_code == 200
    marley_leads = res_search.json()
    assert len(marley_leads) == 1
    assert marley_leads[0]["name"] == "Bob Marley"

    # Search with status filter combined
    res_combo = client.get("/api/leads?status=New&search=Alice")
    assert res_combo.status_code == 200
    assert len(res_combo.json()) == 1
    assert res_combo.json()[0]["id"] == l1["id"]

    # Search with no match
    res_empty = client.get("/api/leads?search=NonExistentPerson")
    assert res_empty.status_code == 200
    assert len(res_empty.json()) == 0


def test_retrieve_lead_with_discussions_in_reverse_chronological_order(client):
    """6. Retrieving a lead with discussions in reverse chronological order."""
    lead = client.post("/api/leads", json={"name": "Timeline Lead"}).json()
    lead_id = lead["id"]

    # Add three discussions with small time separation
    disc1 = client.post(
        f"/api/leads/{lead_id}/discussions",
        json={"note": "First discussion note"},
    ).json()

    disc2 = client.post(
        f"/api/leads/{lead_id}/discussions",
        json={"note": "Second discussion note"},
    ).json()

    disc3 = client.post(
        f"/api/leads/{lead_id}/discussions",
        json={"note": "Third discussion note"},
    ).json()

    response = client.get(f"/api/leads/{lead_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == lead_id
    assert len(data["discussions"]) == 3
    # Reverse chronological order: newest first
    assert data["discussions"][0]["id"] == disc3["id"]
    assert data["discussions"][1]["id"] == disc2["id"]
    assert data["discussions"][2]["id"] == disc1["id"]


def test_return_404_for_nonexistent_lead(client):
    """7. Returning 404 for a nonexistent lead."""
    res_get = client.get("/api/leads/99999")
    assert res_get.status_code == 404
    assert res_get.json()["detail"] == "Lead with ID 99999 not found"

    res_patch = client.patch("/api/leads/99999/status", json={"status": "Contacted"})
    assert res_patch.status_code == 404

    res_disc = client.post("/api/leads/99999/discussions", json={"note": "A note"})
    assert res_disc.status_code == 404


def test_update_lead_status_and_verify_persistence(client):
    """8. Updating a lead's status and verifying persistence."""
    lead = client.post("/api/leads", json={"name": "Status Lead"}).json()
    lead_id = lead["id"]
    assert lead["status"] == "New"

    update_res = client.patch(
        f"/api/leads/{lead_id}/status",
        json={"status": "Proposal Sent"},
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["status"] == "Proposal Sent"

    # Verify persistence by fetching
    fetch_res = client.get(f"/api/leads/{lead_id}")
    assert fetch_res.status_code == 200
    assert fetch_res.json()["status"] == "Proposal Sent"


def test_reject_invalid_status(client):
    """9. Rejecting an invalid status."""
    lead = client.post("/api/leads", json={"name": "Valid Lead"}).json()
    lead_id = lead["id"]

    # Invalid status in PATCH
    patch_res = client.patch(
        f"/api/leads/{lead_id}/status",
        json={"status": "SuperHotLead"},
    )
    assert patch_res.status_code == 422

    # Invalid status in query parameter
    query_res = client.get("/api/leads?status=NotAStatus")
    assert query_res.status_code == 422


def test_add_discussion_without_follow_up_date(client):
    """10. Adding a discussion without a follow-up date."""
    lead = client.post("/api/leads", json={"name": "Discussion Lead"}).json()
    lead_id = lead["id"]

    response = client.post(
        f"/api/leads/{lead_id}/discussions",
        json={"note": "Call completed, client interested."},
    )
    assert response.status_code == 201
    disc = response.json()
    assert disc["id"] is not None
    assert disc["lead_id"] == lead_id
    assert disc["note"] == "Call completed, client interested."
    assert disc["follow_up_at"] is None

    # Lead's next_follow_up_at remains None
    fetch_lead = client.get(f"/api/leads/{lead_id}").json()
    assert fetch_lead["next_follow_up_at"] is None


def test_add_discussion_with_follow_up_updates_lead_atomically(client):
    """11. Adding a discussion with a follow-up date and verifying that both discussion and lead are updated."""
    lead = client.post("/api/leads", json={"name": "Follow-up Lead"}).json()
    lead_id = lead["id"]

    target_time = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()

    response = client.post(
        f"/api/leads/{lead_id}/discussions",
        json={
            "note": "Agreed to follow-up meeting in 3 days.",
            "follow_up_at": target_time,
        },
    )
    assert response.status_code == 201
    disc = response.json()
    assert disc["follow_up_at"] is not None

    # Check lead detail
    fetch_lead = client.get(f"/api/leads/{lead_id}").json()
    assert fetch_lead["next_follow_up_at"] is not None

    # Check lead list summary
    list_res = client.get("/api/leads").json()
    summary = next(l for l in list_res if l["id"] == lead_id)
    assert summary["next_follow_up_at"] is not None
    assert summary["last_discussion_note"] == "Agreed to follow-up meeting in 3 days."


def test_discussion_without_follow_up_does_not_erase_existing_scheduled_follow_up(client):
    """12. Confirming that a discussion without a follow-up does not erase an existing scheduled follow-up."""
    lead = client.post("/api/leads", json={"name": "Preserve Follow-up Lead"}).json()
    lead_id = lead["id"]

    target_time = (datetime.now(timezone.utc) + timedelta(days=5)).isoformat()

    # First discussion sets follow_up_at
    client.post(
        f"/api/leads/{lead_id}/discussions",
        json={
            "note": "Scheduled demo call.",
            "follow_up_at": target_time,
        },
    )

    lead_after_first = client.get(f"/api/leads/{lead_id}").json()
    initial_scheduled = lead_after_first["next_follow_up_at"]
    assert initial_scheduled is not None

    # Second discussion WITHOUT follow_up_at
    client.post(
        f"/api/leads/{lead_id}/discussions",
        json={"note": "Quick intermediate update via chat."},
    )

    # Verify that lead.next_follow_up_at was NOT erased
    lead_after_second = client.get(f"/api/leads/{lead_id}").json()
    assert lead_after_second["next_follow_up_at"] == initial_scheduled


def test_reject_blank_discussion_notes(client):
    """13. Rejecting blank discussion notes."""
    lead = client.post("/api/leads", json={"name": "Note Lead"}).json()
    lead_id = lead["id"]

    # Missing note
    res1 = client.post(f"/api/leads/{lead_id}/discussions", json={})
    assert res1.status_code == 422

    # Empty string note
    res2 = client.post(f"/api/leads/{lead_id}/discussions", json={"note": ""})
    assert res2.status_code == 422

    # Whitespace-only note
    res3 = client.post(f"/api/leads/{lead_id}/discussions", json={"note": "   \n\t  "})
    assert res3.status_code == 422


def test_reject_naive_datetime_in_follow_up(client):
    """Reject ambiguous naive datetimes without timezone offset."""
    lead = client.post("/api/leads", json={"name": "Naive Time Lead"}).json()
    lead_id = lead["id"]

    # Naive datetime string without 'Z' or offset (e.g. "2026-10-25T14:30:00")
    response = client.post(
        f"/api/leads/{lead_id}/discussions",
        json={
            "note": "Ambiguous naive datetime",
            "follow_up_at": "2026-10-25T14:30:00",
        },
    )
    assert response.status_code == 422
