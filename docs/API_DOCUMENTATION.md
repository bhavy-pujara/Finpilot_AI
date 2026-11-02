# FinPilot AI — REST API Reference & Specification (v1)

Base URL: `http://localhost:8000/api/v1`  
OpenAPI Documentation: `http://localhost:8000/docs`  
ReDoc Reference: `http://localhost:8000/redoc`

All protected endpoints require an HTTP header:  
`Authorization: Bearer <JWT_ACCESS_TOKEN>`

---

## 1. Authentication (`/api/v1/auth`)

### `POST /auth/register`
Creates a new user account.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "full_name": "Jane Trader"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "id": 3,
    "email": "user@example.com",
    "full_name": "Jane Trader",
    "role": "TRADER",
    "is_active": true
  }
  ```

### `POST /auth/login`
Authenticates user and returns an RFC 7519 JWT token.
- **Request Form/JSON**: `email` and `password`.
- **Response** (`200 OK`):
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "trader@finpilot.ai",
      "full_name": "Demo Trader",
      "role": "TRADER"
    }
  }
  ```

### `GET /auth/me`
Fetches authenticated user identity and profile metadata.

---

## 2. Dashboard (`/api/v1/dashboard`)

### `GET /dashboard/summary`
Returns high-level terminal telemetry:
- `portfolio`: Net worth, available cash, total realized & unrealized P&L.
- `market_indices`: Live/delayed quotes for NIFTY 50, SENSEX, S&P 500, NASDAQ 100.
- `top_gainers` & `top_losers`: Day percentage changes.
- `open_positions`: Summary count of active paper holdings.
- `recent_activity`: Latest order fills and trade plan creations.

---

## 3. Market Instruments (`/api/v1/instruments`)

### `GET /instruments/`
Lists searchable instruments with exchange, currency, and sector filters.
- **Query Parameters**:
  - `query` (string, optional): e.g. `RELIANCE` or `Apple`
  - `exchange` (string, optional): `NSE`, `BSE`, `NASDAQ`, `NYSE`
  - `limit` (integer, default 50)

### `GET /instruments/{symbol}`
Detailed instrument profile, sector, exchange, and live snapshot.

### `GET /instruments/{symbol}/candles`
Historical and delayed OHLCV candlestick data for charting.
- **Query Parameters**: `timeframe` (`1D`, `1W`), `limit` (default 60 days).

### `GET /instruments/{symbol}/metrics`
Fundamental valuation ratios (P/E, P/B, Debt/Equity, ROE, Beta).

### `GET /instruments/{symbol}/indicators`
Deterministic quantitative technical indicators computed via NumPy/Pandas:
- Wilder's smoothed RSI (14)
- MACD (12, 26, 9) with histogram
- Bollinger Bands (20, 2σ)
- Average True Range (ATR 14)

---

## 4. Trade Risk Planner (`/api/v1/trade-planner`)

### `POST /trade-planner/formulate`
Computes deterministic position sizing and generates risk/reward scenario payoff matrices.
- **Request Body**:
  ```json
  {
    "symbol": "RELIANCE.NS",
    "direction": "BUY",
    "entry_price": 2850.00,
    "target_price": 3100.00,
    "stop_loss": 2750.00,
    "account_capital": 500000.00,
    "risk_pct": 1.5
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "risk_reward_ratio": 2.50,
    "stop_distance_pct": 3.51,
    "target_distance_pct": 8.77,
    "calculated_quantity": 75,
    "total_position_exposure": 213750.00,
    "max_loss_potential": 7500.00,
    "max_profit_potential": 18750.00,
    "scenarios": [
      { "label": "Full Target Hit", "exit_price": 3100.00, "pnl": 18750.00, "return_pct": 8.77 },
      { "label": "Breakeven Exit", "exit_price": 2850.00, "pnl": 0.00, "return_pct": 0.00 },
      { "label": "Stop Loss Hit", "exit_price": 2750.00, "pnl": -7500.00, "return_pct": -3.51 }
    ]
  }
  ```

---

## 5. Paper Trading Execution (`/api/v1/paper-trading`)

### `GET /paper-trading/portfolio`
Returns current paper cash, invested capital, total equity, and margin used.

### `POST /paper-trading/order`
Submits a simulated paper trade order.
- **Request Body**:
  ```json
  {
    "symbol": "INFY.NS",
    "order_type": "MARKET",
    "side": "BUY",
    "quantity": 25,
    "limit_price": null
  }
  ```
- **Execution Safeguard**: Applies 0.05% modeled slippage and simulated exchange turnover charges.

### `GET /paper-trading/positions`
Returns active holdings with real-time unrealized P&L, current market value, and average cost.

### `GET /paper-trading/transactions`
Audit log of all filled, rejected, or cancelled paper orders.

---

## 6. AI Market Assistant & Copilot (`/api/v1/assistant`)

### `POST /assistant/chat`
Conversational RAG query grounded in verified market data and regulatory filings.
- **Request Body**:
  ```json
  {
    "query": "Analyze Apple's gross margin trajectory over recent quarters",
    "symbol": "AAPL"
  }
  ```
- **Response**:
  - `response_text`: Grounded qualitative summary.
  - `citations`: Source filings and data timestamps.
  - `disclaimer`: Regulatory safe harbor warning.
  - `tokens_used`: Usage tracking metric.

---

## 7. Quantitative Equity Research (`/api/v1/research`)

### `GET /research/{symbol}`
Generates a multi-section research report:
1. Executive Summary & Business Moat
2. Quantitative Valuation & Financial Ratios
3. Technical Trend & Momentum Analysis (RSI, Moving Averages)
4. Bull Case Scenario & Catalysts
5. Bear Case Scenario & Structural Risks
6. ESG & Regulatory Governance Factors

---

## 8. Portfolio & Risk Intelligence (`/api/v1/risk`, `/api/v1/portfolio`)

### `GET /risk/metrics`
Computes portfolio-level quantitative risk metrics:
- Parametric Value at Risk (VaR 95% & 99%)
- Historical Value at Risk
- Maximum Drawdown (peak-to-trough decline)
- Sharpe Ratio (annualized)
- Sortino Ratio (downside risk penalization)
- Beta vs Benchmark Index

---

## 9. System Administration (`/api/v1/admin`)
*(Requires role `ADMIN`)*

- `GET /admin/health`: System health telemetry (DB connection, AI provider, uptime).
- `GET /admin/stats`: User counts, order volumes, AI token billing and total cost in USD.
- `GET /admin/users`: User access directory.
- `PUT /admin/users/{user_id}/toggle-status`: Suspend or reinstate user access.
- `GET /admin/audit-logs`: Immutable system security and consent event records.
