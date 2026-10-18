import os
import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert data["lexicon_words"] > 0
    print("✅ Root API endpoint verified:", data["title"])

def test_generate_puzzle():
    res = client.get("/api/puzzle/generate?size=5&reveal=true")
    assert res.status_code == 200
    data = res.json()
    assert "puzzle_id" in data
    assert data["size"] == 5
    assert len(data["mask"]) == 5
    assert len(data["solution"]) == 5
    assert len(data["clues"]["across"]) > 0
    assert len(data["clues"]["down"]) > 0
    print(f"✅ Dynamic Puzzle Generation verified: ID={data['puzzle_id']}, Words={data['meta']['total_words']}")
    print("Sample Across Clue:", data["clues"]["across"][0]["number"], "-", data["clues"]["across"][0]["clue"])

def test_daily_puzzle():
    res1 = client.get("/api/puzzle/daily?reveal=true")
    assert res1.status_code == 200
    data1 = res1.json()

    # Querying a second time should return the exact same daily puzzle
    res2 = client.get("/api/puzzle/daily?reveal=true")
    data2 = res2.json()
    assert data1["puzzle_id"] == data2["puzzle_id"]
    assert data1["solution"] == data2["solution"]
    print(f"✅ Deterministic Daily Puzzle verified: {data1['puzzle_id']}")

def test_verify_endpoint():
    # 1. Generate a puzzle with solution
    res = client.get("/api/puzzle/generate?size=5&reveal=true")
    data = res.json()
    sol = data["solution"]

    # 2. Verify with correct solution
    verify_res = client.post("/api/puzzle/verify", json={
        "solution": sol,
        "user_grid": sol
    })
    assert verify_res.status_code == 200
    v_data = verify_res.json()
    assert v_data["is_complete"] is True
    assert len(v_data["incorrect_cells"]) == 0
    print("✅ Full correct solution verification passed:", v_data["message"])

    # 3. Verify with empty grid
    empty_grid = [["" for _ in range(5)] for _ in range(5)]
    fail_res = client.post("/api/puzzle/verify", json={
        "solution": sol,
        "user_grid": empty_grid
    })
    assert fail_res.status_code == 200
    f_data = fail_res.json()
    assert f_data["is_complete"] is False
    assert len(f_data["incorrect_cells"]) > 0
    print("✅ Incomplete grid verification passed:", f_data["message"])

if __name__ == "__main__":
    test_root()
    test_generate_puzzle()
    test_daily_puzzle()
    test_verify_endpoint()
    print("\n🎉 ALL FASTAPI BACKEND SUITE TESTS PASSED!")
