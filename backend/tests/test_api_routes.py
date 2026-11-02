import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health_check_endpoint(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_root_endpoint(client):
    res = client.get("/")
    assert res.status_code == 200
    assert "FinPilot" in res.json()["app"]

def test_dashboard_overview_endpoint(client):
    res = client.get("/api/v1/dashboard/overview")
    assert res.status_code == 200
    data = res.json()
    assert "indian_indices" in data
    assert "us_indices" in data
    assert "top_gainers" in data
    assert len(data["indian_indices"]) > 0

def test_instruments_list_and_search(client):
    res = client.get("/api/v1/instruments/?q=RELIANCE")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert data[0]["symbol"] == "RELIANCE"

def test_instrument_detail_with_indicators(client):
    res = client.get("/api/v1/instruments/RELIANCE")
    assert res.status_code == 200
    data = res.json()
    assert data["instrument"]["symbol"] == "RELIANCE"
    assert "indicators" in data
    assert "rsi_14" in data["indicators"]
    assert "candles" in data

def test_trade_planner_calculate_api(client):
    payload = {
        "instrument_id": 1,
        "side": "BUY",
        "entry_price": 2900.0,
        "stop_loss": 2800.0,
        "target_price": 3100.0,
        "total_capital": 1000000.0,
        "risk_pct": 1.0
    }
    res = client.post("/api/v1/trade-planner/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["is_valid"] is True
    assert data["position_size"] == 100
    assert data["risk_reward_ratio"] == 2.0

def test_risk_metrics_endpoint(client):
    res = client.get("/api/v1/risk/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "var_95_daily" in data
    assert "max_drawdown_pct" in data
    assert "sharpe_ratio" in data

def test_portfolio_summary_endpoint(client):
    res = client.get("/api/v1/portfolio/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_equity" in data
    assert "asset_allocations" in data
    assert "concentration_hhi" in data

def test_legal_documents_endpoint(client):
    res = client.get("/api/v1/legal/disclaimer")
    assert res.status_code == 200
    assert "SEBI" in res.json()["title"]
