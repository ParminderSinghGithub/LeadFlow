import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    """Test client for API endpoints."""
    with TestClient(app) as test_client:
        yield test_client
