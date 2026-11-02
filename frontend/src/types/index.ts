export type UserRole = "user" | "admin" | "enterprise";

export interface UserProfile {
  bio?: string;
  phone?: string;
  avatar_url?: string;
  default_market: string;
  experience_level: string;
  risk_tolerance: string;
}

export interface UserPreference {
  theme: string;
  default_currency: string;
  email_notifications: boolean;
  in_app_notifications: boolean;
  chart_style: string;
}

export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  profile?: UserProfile;
  preferences?: UserPreference;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface Instrument {
  id: number;
  symbol: string;
  name: string;
  sector?: string;
  currency: string;
  current_price: number;
  change_pct: number;
  day_high: number;
  day_low: number;
  volume_24h: number;
  exchange_code: string;
  data_source_label: string;
}

export interface MarketIndex {
  name: string;
  symbol: string;
  country: string;
  currency: string;
  price: number;
  change_pct: number;
  is_open: boolean;
  status_label: string;
}

export interface MarketDataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
  is_delayed: boolean;
  data_source: string;
}

export interface FinancialMetric {
  metric_date: string;
  market_cap?: number;
  pe_ratio?: number;
  pb_ratio?: number;
  eps?: number;
  roe?: number;
  roce?: number;
  debt_to_equity?: number;
  dividend_yield?: number;
  beta?: number;
  week_52_high?: number;
  week_52_low?: number;
}

export interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  source: string;
  url?: string;
  sentiment_score: number;
  published_at: string;
}

export interface InstrumentDetailResponse {
  instrument: Instrument;
  metrics?: FinancialMetric;
  indicators: {
    sma_20?: number;
    ema_20?: number;
    rsi_14?: number;
    macd?: number;
    macd_signal?: number;
    macd_histogram?: number;
    bollinger_upper?: number;
    bollinger_middle?: number;
    bollinger_lower?: number;
  };
  candles: MarketDataPoint[];
  news: NewsArticle[];
  data_freshness: string;
  last_updated: string;
}

export interface PaperAccount {
  id: number;
  account_number: string;
  currency: string;
  initial_balance: number;
  cash_balance: number;
  invested_value: number;
  total_equity: number;
  realized_pnl: number;
  unrealized_pnl: number;
  total_pnl: number;
  total_return_pct: number;
  open_positions_count: number;
  simulation_label: string;
}

export interface PaperPosition {
  id: number;
  instrument_id: number;
  symbol: string;
  name: string;
  currency: string;
  side: string;
  quantity: number;
  average_entry_price: number;
  current_price: number;
  invested_amount: number;
  current_value: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  simulation_label: string;
  updated_at: string;
}

export interface PaperOrder {
  id: number;
  account_id: number;
  instrument_id: number;
  symbol: string;
  side: "BUY" | "SELL";
  order_type: "MARKET" | "LIMIT" | "STOP_MARKET" | "STOP_LIMIT";
  price?: number;
  trigger_price?: number;
  quantity: number;
  filled_quantity: number;
  execution_price?: number;
  slippage: number;
  commission: number;
  status: "PENDING" | "OPEN" | "FILLED" | "REJECTED" | "CANCELLED";
  rejection_reason?: string;
  simulation_label: string;
  created_at: string;
  executed_at?: string;
}

export interface PaperTransaction {
  id: number;
  portfolio_id: number;
  order_id?: number;
  instrument_id: number;
  symbol: string;
  transaction_type: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  gross_amount: number;
  fee_amount?: number;
  fee?: number;
  net_amount: number;
  realized_pnl?: number;
  timestamp: string;
}

export interface TradePlanCalculation {
  instrument_id: number;
  symbol: string;
  currency: string;
  side: "BUY" | "SELL";
  entry_price: number;
  target_price: number;
  stop_loss: number;
  total_capital: number;
  risk_pct: number;
  risk_amount: number;
  position_size: number;
  capital_required: number;
  exposure_pct_of_capital: number;
  max_loss: number;
  max_profit: number;
  risk_reward_ratio: number;
  stop_loss_pct: number;
  target_pct: number;
  is_valid: boolean;
  validation_message?: string;
  scenarios: Array<{
    label: string;
    exit_price: number;
    pnl: number;
    pnl_pct: number;
    account_impact_pct: number;
  }>;
  educational_notes: string[];
}

export interface RiskMetrics {
  currency: string;
  var_95_daily: number;
  var_99_daily: number;
  max_drawdown_pct: number;
  max_drawdown_duration_days: number;
  annualized_volatility: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  beta_vs_benchmark: number;
  benchmark_symbol: string;
  current_cash_pct: number;
  single_stock_max_exposure_pct: number;
  single_stock_max_exposure_symbol: string;
  risk_warnings: string[];
  compliance_disclaimer: string;
}

export interface ResearchReport {
  id: number;
  instrument_id: number;
  symbol: string;
  name: string;
  title: string;
  company_overview: string;
  business_model: string;
  bull_thesis: string[];
  bear_thesis: string[];
  risk_factors: string[];
  financial_analysis: string;
  technical_summary: string;
  data_quality_warnings: string[];
  metrics_snapshot?: Record<string, any>;
  sources: Array<{
    title: string;
    url?: string;
    source_type: string;
    timestamp_retrieved: string;
    confidence_score: number;
  }>;
  generated_at: string;
  data_freshness_label: string;
}

export interface JournalEntry {
  id: number;
  instrument_id: number;
  symbol: string;
  trade_type: string;
  side: "BUY" | "SELL";
  entry_date: string;
  exit_date?: string;
  entry_price: number;
  exit_price?: number;
  quantity: number;
  realized_pnl: number;
  strategy_tag: string;
  emotional_state: string;
  rationale: string;
  mistakes?: string;
  lessons_learned?: string;
  rating: number;
  created_at: string;
}

export interface JournalAnalytics {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate_pct: number;
  profit_factor: number;
  average_win: number;
  average_loss: number;
  expectancy: number;
  strategy_breakdown: Array<{
    strategy: string;
    trade_count: number;
    win_rate: number;
    net_pnl: number;
  }>;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  category: string;
  is_read: boolean;
  data_source_label: string;
  action_url?: string;
  created_at: string;
}
