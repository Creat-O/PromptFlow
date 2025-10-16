from app import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["ok"] is True


def test_execute_mock(monkeypatch):
    def mock_create(*args, **kwargs):
        class R:
            choices = [type("m", (), {"message": type("c", (), {"content": "mocked"})})]

        return R()

    monkeypatch.setattr("app.client.chat.completions.create", mock_create)
    resp = client.post(
        "/execute", json={"id": "1", "prompt": "Hi", "provider": "test", "context": {}}
    )
    assert resp.status_code == 200
    assert "output" in resp.json()
