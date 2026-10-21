from datetime import datetime, timezone, timedelta
from app.database import SessionLocal
from app.models import Lead, Discussion


def seed_database() -> None:
    """
    Seed the database with realistic fictional CRM leads and discussions.
    Idempotent: Safe to execute repeatedly without creating duplicate records.
    """
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        today_follow_up = now.replace(hour=16, minute=30, second=0, microsecond=0)
        overdue_follow_up = now - timedelta(days=2)
        future_follow_up = now + timedelta(days=5)

        seed_data = [
            {
                "name": "Marcus Vance",
                "company": "Apex Logistics",
                "phone": "+1-555-234-5678",
                "status": "Qualified",
                "next_follow_up_at": today_follow_up,
                "discussions": [
                    {
                        "note": "Initial discovery call on fleet tracking requirements for 45 regional hubs.",
                        "created_at": now - timedelta(days=4),
                        "follow_up_at": None,
                    },
                    {
                        "note": "Reviewed revised fleet tracking quote. Marcus asked for final SLA confirmation before signing.",
                        "created_at": now - timedelta(hours=2),
                        "follow_up_at": today_follow_up,
                    },
                ],
            },
            {
                "name": "Elena Rostova",
                "company": "CloudScale AI",
                "phone": "+1-555-876-5432",
                "status": "Contacted",
                "next_follow_up_at": overdue_follow_up,
                "discussions": [
                    {
                        "note": "Sent introductory technical overview and API rate sheet. Follow-up promised for 2 days ago.",
                        "created_at": now - timedelta(days=3),
                        "follow_up_at": overdue_follow_up,
                    },
                ],
            },
            {
                "name": "Sarah Connor",
                "company": "Cyberdyne Systems",
                "phone": "+1-555-345-6789",
                "status": "New",
                "next_follow_up_at": None,
                "discussions": [],  # Lead with zero discussions
            },
            {
                "name": "David Kim",
                "company": "NextGen BioLabs",
                "phone": "+1-555-456-7890",
                "status": "Proposal Sent",
                "next_follow_up_at": future_follow_up,
                "discussions": [
                    {
                        "note": "Technical deep-dive on HIPAA compliance and VPC deployment models.",
                        "created_at": now - timedelta(days=7),
                        "follow_up_at": None,
                    },
                    {
                        "note": "Delivered customized enterprise security proposal. Procurement committee review meeting scheduled.",
                        "created_at": now - timedelta(days=1),
                        "follow_up_at": future_follow_up,
                    },
                ],
            },
            {
                "name": "Rachel Green",
                "company": "Central Perk Media",
                "phone": "+1-555-567-8901",
                "status": "Won",
                "next_follow_up_at": None,
                "discussions": [
                    {
                        "note": "Contract signed! 12-month annual subscription activated. Handed off to Customer Success team.",
                        "created_at": now - timedelta(days=5),
                        "follow_up_at": None,
                    },
                ],
            },
            {
                "name": "Jordan Hayes",
                "company": "BluePeak Capital",
                "phone": "+1-555-678-9012",
                "status": "Lost",
                "next_follow_up_at": None,
                "discussions": [
                    {
                        "note": "Client postponed CRM migration project until next fiscal year due to internal budget reallocations.",
                        "created_at": now - timedelta(days=10),
                        "follow_up_at": None,
                    },
                ],
            },
        ]

        inserted_count = 0
        skipped_count = 0

        for item in seed_data:
            existing_lead = db.query(Lead).filter(Lead.name == item["name"]).first()
            if existing_lead:
                skipped_count += 1
                continue

            lead = Lead(
                name=item["name"],
                company=item["company"],
                phone=item["phone"],
                status=item["status"],
                next_follow_up_at=item["next_follow_up_at"],
                created_at=now - timedelta(days=15),
                updated_at=now,
            )
            db.add(lead)
            db.flush()  # Flush to generate lead.id for foreign key relationship

            for disc_item in item["discussions"]:
                discussion = Discussion(
                    lead_id=lead.id,
                    note=disc_item["note"],
                    created_at=disc_item["created_at"],
                    follow_up_at=disc_item["follow_up_at"],
                )
                db.add(discussion)

            inserted_count += 1

        db.commit()
        print(f"Database seed complete: {inserted_count} inserted, {skipped_count} skipped (already existed).")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
