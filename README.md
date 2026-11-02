# FinPilot AI — Multi-Market Financial Intelligence & Trading Copilot SaaS

> **"Understand the trade before you make it."**

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-black.svg)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Styles-Tailwind%20v3-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Safety: Paper Only](https://img.shields.io/badge/Execution-100%25%20Paper%20Simulated-emerald.svg)](#paper-trading-safety-boundary)

---

## 1. Executive Product Overview

**FinPilot AI** is an institutional-grade financial market intelligence workstation and deterministic trading copilot designed for cross-market traders and retail investors. It bridges quantitative analytics, algorithmic risk planning, and grounded AI reasoning across both Indian markets (**NSE / BSE in ₹ INR**) and US markets (**NYSE / NASDAQ in $ USD**).

### Core Pillars
1. **Deterministic Quantitative Analytics**: Real-time Wilder's smoothed RSI, MACD with signal line, Bollinger Bands, ATR, Historical & Parametric Value at Risk (VaR 95% & 99%), Maximum Drawdown, Sharpe, Sortino, and Beta vs Benchmark computed via high-performance NumPy and Pandas.
2. **Deterministic Trade Risk Planner**: Mathematical position sizing based on fixed fractional risk (% of portfolio equity) and Average True Range (ATR) stop distances. Generates multi-scenario risk-to-reward payoff matrices before any capital allocation.
3. **Paper Trading Simulation Engine**: Realistic paper execution modeling 0.05% market impact slippage, exchange turnover fees, weighted-average cost basis accounting, cash balance validation, and automated realized/unrealized P&L marking.
4. **AI Market Intelligence & RAG Copilot**: Offline-resilient financial reasoning copilot equipped with retrieval-augmented generation (RAG) over financial filings, market documents, and news. Enforces strict safety guardrails that redact any predictive return guarantees or speculative promises.
5. **Simulated Broker Gateway**: Pluggable mock architecture supporting Zerodha Kite Connect, Angel One SmartAPI, and Alpaca Markets with consent audit logs and simulated fee calculators.
6. **Zero-Setup Local Dev & Neon/Postgres Production**: Dual-database architecture using zero-configuration local SQLite (`finpilot.db`) with automatic fallback or high-availability PostgreSQL on Neon.

---

## 2. Paper Trading Safety Boundary & Regulatory Safe Harbor

> [!IMPORTANT]
> **FinPilot AI is strictly an educational and analytical research workstation.**
> - **Real-money live order routing is permanently disabled.** All orders, transactions, and positions are explicitly marked and logged as `[PAPER TRADE / SIMULATED]`.
> - **Not Registered Investment Advice:** FinPilot AI is not registered with the Securities and Exchange Board of India (SEBI) as a Research Analyst or Investment Adviser, nor with the US Securities and Exchange Commission (SEC) or FINRA.
> - **Transparent Data Freshness:** All quotes and telemetry are clearly badge-labeled as `[LIVE]`, `[DELAYED 15m]`, `[HISTORICAL]`, or `[SIMULATED]`.

---

## 3. Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.10+) with async support and auto-generated OpenAPI v3 docs.
- **ORM & Data Layer**: SQLAlchemy 2.0 with Alembic database migrations.
- **Quantitative Engine**: NumPy and Pandas for deterministic matrix calculations, returns, risk models, and technical indicators.
- **Security**: Native `bcrypt` password hashing, stateless RFC 7519 JSON Web Tokens (JWT), role-based access control (`ADMIN`, `PRO_TRADER`, `TRADER`).
- **AI & RAG Engine**: Gemini Pro with offline fallback financial intelligence heuristics, cosine semantic similarity search over financial document chunks.
- **Testing**: Pytest with automated coverage for math models, paper trading engine, security, and API endpoints.

### Frontend
- **Framework**: Next.js 14 (App Router) with React 18 and TypeScript.
- **Styling**: Tailwind CSS with dark-mode institutional terminal theme (slate-950 palette).
- **Icons**: Lucide React.
- **Visualizations**: Pure high-fidelity SVG Candlestick Charts with overlay SMA/EMA ribbons and volume subplots.

---

## 4. Default Demo Accounts

Upon initial startup, the backend automatically seeds the database with the following demo credentials:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@finpilot.ai` | `Admin123!` | System health, user management, audit logs, AI cost metrics |
| **Demo Trader** | `trader@finpilot.ai` | `Trader123!` | Full access to paper trading, portfolio, AI copilot, journals |

---

## 5. Quickstart & Local Installation

### Prerequisites
- Python 3.10, 3.11, 3.12, 3.13, or 3.14
- Node.js 18+ & npm
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/finpilot-ai/finpilot-platform.git
cd "Finpilot AI"
```

### Step 2: Configure Environment
Copy the sample environment file:
```bash
cp .env.example .env
```
*(The default configuration runs out of the box with zero external dependencies, using local SQLite and the deterministic fallback AI provider).*

---

### Step 3: Backend Setup (FastAPI)
Using Windows PowerShell or bash:
```powershell
# Create Python virtual environment
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\Activate.ps1
# On macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (or let FastAPI auto-create and seed tables on start)
python -m app.core.seed

# Run automated tests
python -m pytest -c pytest.ini tests

# Start FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The interactive Swagger API documentation will be available at:
`http://localhost:8000/docs`

---

### Step 4: Frontend Setup (Next.js)
In a separate terminal:
```powershell
cd frontend

# Install dependencies
# On Windows:
cmd.exe /c "npm install"
# On macOS / Linux:
npm install

# Run development server
npm run dev
```
Open your browser and navigate to:
`http://localhost:3000`

---

## 6. Docker Compose Deployment

To launch the complete containerized stack (FastAPI backend, Next.js frontend, and PostgreSQL):

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

---

## 7. Platform Architecture & Feature Matrix

| Feature Module | URL Route | Description |
| :--- | :--- | :--- |
| **Institutional Landing** | `/` | Product pitch, live mock ticker, feature highlights, compliance notice |
| **Authentication** | `/login`, `/register` | Secure JWT login with 1-click demo credential filling |
| **Terminal Dashboard** | `/dashboard` | Portfolio net worth, market indices, open positions, recent activity |
| **Market Intelligence** | `/markets` | Multi-market screener for NSE/BSE (₹) and US ($) with filters |
| **Interactive Terminal** | `/markets/[symbol]` | Candlestick SVG charts, SMA/EMA overlays, financial ratios, order book |
| **AI Copilot** | `/assistant` | RAG-grounded trading assistant with citations and safety filters |
| **Quantitative Research** | `/research` | AI-generated financial thesis, bull/bear scenarios, ESG/catalyst analysis |
| **Trade Risk Planner** | `/trade-planner` | Deterministic position sizing, ATR stops, R:R scenario payoff table |
| **Paper Trading Desk** | `/paper-trading` | Realistic order execution (Limit/Market), slippage simulation, positions |
| **Portfolio Intelligence**| `/portfolio` | Asset allocation, sector breakdown, P&L attribution, concentration metrics |
| **Risk Analytics** | `/risk` | Historical & Parametric VaR, Maximum Drawdown, Sharpe & Sortino ratios |
| **Trading Journal** | `/journal` | Psychological tag tracking, trade notes, win rate analytics, lessons |
| **Broker Architecture** | `/broker` | Zerodha Kite, Angel One, Alpaca mock adapters with consent audit |
| **Admin Console** | `/admin` | Infrastructure telemetry, user access toggle, AI token tracking, audit |
| **Alerts & Notices** | `/notifications` | Execution fills, margin warnings, volatility spikes |
| **Legal & Safe Harbor** | `/legal/[slug]` | Terms of service, privacy policy, comprehensive risk disclosure |

---

## 8. Automated Test Suite Verification

FinPilot AI ships with a 100% passing automated test suite covering financial mathematics, paper trading matching, authentication security, and REST API integrity:

```powershell
python -m pytest -c backend/pytest.ini backend/tests
```

```text
============================= test session starts =============================
platform win32 -- Python 3.14.0, pytest-8.3.3
collected 29 items

tests/test_ai_safety.py ...                                              [ 10%]
tests/test_analytics.py ............                                     [ 51%]
tests/test_api_routes.py .........                                       [ 82%]
tests/test_auth.py ...                                                   [ 93%]
tests/test_paper_trading.py ..                                           [100%]

======================== 29 passed in 129.70s =================================
```

---

## 9. Comprehensive Documentation Index

Explore in-depth engineering documentation in the [`docs/`](./docs) directory:
- [System Architecture & Data Flows](./docs/ARCHITECTURE.md)
- [Database Schema & ER Models](./docs/DATABASE_SCHEMA.md)
- [REST API Specifications](./docs/API_DOCUMENTATION.md)
- [Security, Safeguards & Guardrails](./docs/SECURITY.md)
- [Testing Methodology & Suites](./docs/TESTING.md)
- [Production Deployment & Scaling](./docs/DEPLOYMENT.md)

---

## 10. License & Statutory Disclaimers

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

*Disclaimer: FinPilot AI does not execute real financial transactions and does not hold customer funds. All financial data, indicators, scenarios, and trade plans are purely hypothetical simulations intended for educational and quantitative analysis.*
