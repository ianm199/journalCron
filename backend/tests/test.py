# test_main.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.main import app, Base, get_db

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Override the dependency to use our test database
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    # Create tables for each test
    Base.metadata.create_all(bind=engine)
    yield
    # Drop tables after each test
    Base.metadata.drop_all(bind=engine)


def test_register_user():
    response = client.post(
        "/register",
        json={"email": "test@example.com", "password": "testpassword"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_register_duplicate_user():
    # Register first user
    client.post(
        "/register",
        json={"email": "test@example.com", "password": "testpassword"}
    )

    # Try to register the same user again
    response = client.post(
        "/register",
        json={"email": "test@example.com", "password": "testpassword"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


def test_login():
    # Register user first
    client.post(
        "/register",
        json={"email": "test@example.com", "password": "testpassword"}
    )

    # Test login
    response = client.post(
        "/token",
        data={"username": "test@example.com", "password": "testpassword"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password():
    # Register user first
    client.post(
        "/register",
        json={"email": "test@example.com", "password": "testpassword"}
    )

    # Test login with wrong password
    response = client.post(
        "/token",
        data={"username": "test@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401


class TestNotesWithAuth:
    @pytest.fixture(autouse=True)
    def setup_user(self):
        # Register and login a user before each test
        register_response = client.post(
            "/register",
            json={"email": "test@example.com", "password": "testpassword"}
        )
        self.token = register_response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_create_note(self):
        response = client.post(
            "/notes",
            json={"title": "Test Note", "content": "Test Content"},
            headers=self.headers
        )
        assert response.status_code == 200
        assert response.json()["title"] == "Test Note"
        assert response.json()["content"] == "Test Content"

    def test_read_notes(self):
        # Create a note first
        client.post(
            "/notes",
            json={"title": "Test Note", "content": "Test Content"},
            headers=self.headers
        )

        # Get all notes
        response = client.get("/notes", headers=self.headers)
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["title"] == "Test Note"

    def test_read_single_note(self):
        # Create a note first
        create_response = client.post(
            "/notes",
            json={"title": "Test Note", "content": "Test Content"},
            headers=self.headers
        )
        note_id = create_response.json()["id"]

        # Get the specific note
        response = client.get(f"/notes/{note_id}", headers=self.headers)
        assert response.status_code == 200
        assert response.json()["title"] == "Test Note"
        assert response.json()["id"] == note_id

    def test_update_note(self):
        # Create a note first
        create_response = client.post(
            "/notes",
            json={"title": "Test Note", "content": "Test Content"},
            headers=self.headers
        )
        note_id = create_response.json()["id"]

        # Update the note
        response = client.put(
            f"/notes/{note_id}",
            json={"title": "Updated Note", "content": "Updated Content"},
            headers=self.headers
        )
        assert response.status_code == 200
        assert response.json()["title"] == "Updated Note"
        assert response.json()["content"] == "Updated Content"

    def test_delete_note(self):
        # Create a note first
        create_response = client.post(
            "/notes",
            json={"title": "Test Note", "content": "Test Content"},
            headers=self.headers
        )
        note_id = create_response.json()["id"]

        # Delete the note
        response = client.delete(f"/notes/{note_id}", headers=self.headers)
        assert response.status_code == 200

        # Verify note is deleted
        get_response = client.get(f"/notes/{note_id}", headers=self.headers)
        assert get_response.status_code == 404

    def test_access_note_without_auth(self):
        response = client.get("/notes")
        assert response.status_code == 401

    def test_access_other_user_note(self):
        # Create a note with first user
        create_response = client.post(
            "/notes",
            json={"title": "Test Note", "content": "Test Content"},
            headers=self.headers
        )
        note_id = create_response.json()["id"]

        # Create second user
        register_response = client.post(
            "/register",
            json={"email": "test2@example.com", "password": "testpassword"}
        )
        second_user_token = register_response.json()["access_token"]
        second_user_headers = {"Authorization": f"Bearer {second_user_token}"}

        # Try to access first user's note with second user
        response = client.get(f"/notes/{note_id}", headers=second_user_headers)
        assert response.status_code == 404

if __name__ == '__main__':
    pytest.main()
