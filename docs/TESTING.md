# FinPilot AI — Automated Testing Suite & Quality Assurance

FinPilot AI implements a comprehensive testing framework designed to validate quantitative accuracy, paper trading integrity, cryptographic authentication, and AI copilot safety guardrails.

---

## 1. Test Architecture & Structure

The backend test suite is located in `backend/tests/` and configured via `backend/pytest.ini`:

```text
backend/tests/
├── conftest.py               # Shared test fixtures (isolated SQLite memory DB, demo users, sample instruments)
├── test_analytics.py         # 12 unit tests: RSI, MACD, Bollinger Bands, ATR, VaR, Sharpe, Drawdown, Sizing
├── test_paper_trading.py     # 2 integration tests: Order placement, slippage, weighted average price, P&L
├── test_auth.py              # 3 security tests: Password hashing, token generation/decode, RBAC protection
├── test_ai_safety.py         # 3 safety tests: Guarantee redaction, RAG citation, safe harbor enforcement
└── test_api_routes.py        # 9 end-to-end tests: Dashboard, instruments, research, journal, risk, planner
```

---

## 2. Test Categories & Invariants Tested

### 2.1. Quantitative Mathematics & Technical Indicators (`test_analytics.py`)
- **Wilder's Smoothed RSI**:
  - Bound invariant: $0.0 \le \text{RSI} \le 100.0$ for all price series.
  - Zero-loss series evaluated to exactly $100.0$.
  - Zero-gain series evaluated to exactly $0.0$.
- **Moving Average Convergence Divergence (MACD)**:
  - Validates 12 EMA, 26 EMA, and 9 EMA Signal line relationships.
  - Validates histogram calculation: $\text{Hist} = \text{MACD} - \text{Signal}$.
- **Bollinger Bands**:
  - Validates upper band $> \text{SMA 20} > \text{lower band}$.
  - Confirms standard deviation multiplier ($\pm 2\sigma$).
- **Average True Range (ATR)**:
  - Validates high-low, high-close, and low-close maximum range logic.
- **Value at Risk (VaR)**:
  - Validates 95% and 99% parametric normal distribution quantile scaling.
  - Confirms empirical historical quantile matching.
- **Maximum Drawdown**:
  - Validates peak-to-trough calculation and duration indexing.
- **Position Sizing Matrix**:
  - Validates fixed fractional risk formula against portfolio equity and stop distances.
  - Verifies integer quantity truncation (no fractional shares in equity spot).

### 2.2. Paper Trading Simulation Desk (`test_paper_trading.py`)
- **Order Slippage Invariant**: Fills BUY orders at `market_price * (1 + 0.0005)` and SELL orders at `market_price * (1 - 0.0005)`.
- **Turnover Fees**: Confirms simulated exchange charges are deducted from available cash.
- **Cost Basis Math**: Tests successive buy tranches (e.g. 10 shares @ ₹2,500 + 10 shares @ ₹2,700) to confirm weighted average entry price becomes ₹2,600.
- **Realized P&L**: Verifies P&L calculation upon closing position tranches.

### 2.3. Authentication & Access Security (`test_auth.py`)
- **Password Salting**: Confirms raw passwords are never stored in plaintext and native `bcrypt.checkpw` verifies successfully.
- **Token Validity**: Verifies expired tokens are rejected with HTTP 401 Unauthorized.
- **Role Enforcement**: Verifies `/api/v1/admin/*` routes return HTTP 403 Forbidden when accessed by non-admin accounts.

### 2.4. AI Safety & Compliance Guardrails (`test_ai_safety.py`)
- **Guarantee Interception**: Verifies strings containing phrases like "guaranteed 50% profit" are flagged and redacted.
- **Mandatory Safe Harbor**: Verifies all generated outputs contain the educational disclaimer footer.
- **RAG Citation Grounding**: Confirms citations are appended referencing source documents.

---

## 3. How to Run the Test Suite

### Running Pytest (Backend)
Activate your Python virtual environment and run:

```powershell
# From the backend directory:
cd backend
python -m pytest -c pytest.ini tests -v
```

Expected output:
```text
============================= test session starts =============================
platform win32 -- Python 3.14.0, pytest-8.3.3
collected 29 items

tests/test_ai_safety.py::test_guarantee_redaction PASSED                 [  3%]
tests/test_ai_safety.py::test_mandatory_safe_harbor PASSED               [  6%]
tests/test_ai_safety.py::test_rag_citation_grounding PASSED              [ 10%]
tests/test_analytics.py::test_rsi_bounds_and_values PASSED               [ 13%]
tests/test_analytics.py::test_macd_calculation PASSED                     [ 17%]
tests/test_analytics.py::test_bollinger_bands PASSED                     [ 20%]
tests/test_analytics.py::test_atr_calculation PASSED                     [ 24%]
tests/test_analytics.py::test_historical_var PASSED                     [ 27%]
tests/test_analytics.py::test_parametric_var PASSED                     [ 31%]
tests/test_analytics.py::test_max_drawdown PASSED                        [ 34%]
tests/test_analytics.py::test_sharpe_sortino PASSED                      [ 37%]
tests/test_analytics.py::test_beta_calculation PASSED                    [ 41%]
tests/test_analytics.py::test_position_sizing PASSED                     [ 44%]
tests/test_analytics.py::test_scenario_matrix PASSED                     [ 48%]
tests/test_analytics.py::test_hhi_concentration PASSED                   [ 51%]
tests/test_api_routes.py::test_dashboard_summary PASSED                  [ 55%]
tests/test_api_routes.py::test_instruments_list PASSED                   [ 58%]
tests/test_api_routes.py::test_instrument_detail PASSED                  [ 62%]
tests/test_api_routes.py::test_instrument_candles PASSED                 [ 65%]
tests/test_api_routes.py::test_trade_planner_endpoint PASSED             [ 68%]
tests/test_api_routes.py::test_research_report_endpoint PASSED           [ 72%]
tests/test_api_routes.py::test_risk_metrics_endpoint PASSED              [ 75%]
tests/test_api_routes.py::test_journal_crud PASSED                       [ 79%]
tests/test_api_routes.py::test_admin_system_health PASSED                [ 82%]
tests/test_auth.py::test_native_bcrypt_hashing PASSED                    [ 86%]
tests/test_auth.py::test_jwt_encode_decode PASSED                        [ 89%]
tests/test_auth.py::test_admin_role_authorization PASSED                 [ 93%]
tests/test_paper_trading.py::test_paper_order_slippage_and_fill PASSED   [ 96%]
tests/test_paper_trading.py::test_weighted_average_cost_basis PASSED     [100%]

======================== 29 passed in 129.70s =================================
```

---

## 4. Frontend Type & Component Verification

To verify that the Next.js TypeScript definitions and React components compile cleanly without errors:

```powershell
cd frontend
npm run typecheck
```
