import React from 'react';
import { RefreshCw, Bell, Clock } from 'lucide-react';

interface TopBarProps {
  pageTitle: string;
  pageSubtitle: string;
  onRefresh: () => void;
  lastUpdate: Date;
  alertCount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number;
}

const tickerItems = [
  'FRAUD_DETECT_MODEL · ACC 94.2%', 
  'CREDIT_SCORE_LLM · LAT 643ms', 
  'AML_CLASSIFIER · DRIFT 8.1%', 
  'KYC_VERIFICATION · SAFE ✓',
  'LOAN_APPROVER_V3 · BIAS 6.2%',
  'MARKET_RISK_AI · UPTIME 99.9%',
  'COMPLIANCE_BOT · HALLUC 2.1%',
  'TRANSACTION_NLP · RPM 87',
];

export function TopBar({ pageTitle, pageSubtitle, onRefresh, lastUpdate, alertCount, riskLevel, riskScore }: TopBarProps) {
  const riskConfig = {
    LOW: { label: 'LOW RISK', cls: 'badge-stable', dot: 'bg-success' },
    MEDIUM: { label: 'MED RISK', cls: 'badge-warning', dot: 'bg-warning animate-pulse' },
    HIGH: { label: 'HIGH RISK', cls: 'badge-danger', dot: 'bg-danger animate-pulse' },
  }[riskLevel];

  return (
    <header className="border-b border-border bg-surface-1/50 backdrop-blur-sm sticky top-0 z-10">
      {/* Ticker */}
      <div className="border-b border-border bg-surface-1 overflow-hidden py-1.5">
        <div className="flex overflow-hidden">
          <div className="ticker-inner flex gap-8 whitespace-nowrap text-[10px] font-mono text-foreground-subtle">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary/60" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="flex items-center justify-between px-6 py-3 gap-4">
        <div className="min-w-0">
          <h1 className="text-base font-bold text-foreground truncate">{pageTitle}</h1>
          <p className="text-xs text-foreground-muted truncate">{pageSubtitle}</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Global risk score */}
          <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-3 py-1.5">
            <span className="section-label">RISK</span>
            <span className="font-mono font-bold text-sm text-foreground">{riskScore}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${riskConfig.cls}`}>{riskConfig.label}</span>
          </div>

          {/* Alerts */}
          <div className="relative flex items-center justify-center w-9 h-9 bg-surface-2 border border-border rounded-lg cursor-pointer hover:border-primary/40 transition-colors">
            <Bell className="w-4 h-4 text-foreground-muted" />
            {alertCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 text-[9px] font-mono font-bold bg-danger text-white rounded-full w-4 h-4 flex items-center justify-center">
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </div>

          {/* Last update */}
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono text-foreground-subtle">
            <Clock className="w-3 h-3" />
            {lastUpdate.toLocaleTimeString()}
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-primary/10 border border-primary/30 text-primary rounded-lg hover:bg-primary/20 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>

          {/* Live badge */}
          <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-lg px-3 py-1.5">
            <div className="live-dot" />
            <span className="text-[10px] font-mono font-bold text-success uppercase tracking-widest">Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}
