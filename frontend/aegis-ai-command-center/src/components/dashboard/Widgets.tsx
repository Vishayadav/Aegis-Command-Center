import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string;
  subValue?: string;
  delta?: number;
  deltaLabel?: string;
  status?: 'stable' | 'warning' | 'danger';
  icon?: React.ReactNode;
  monospace?: boolean;
}

export function KpiCard({ label, value, subValue, delta, deltaLabel, status = 'stable', icon, monospace = true }: KpiCardProps) {
  const statusBorder = {
    stable: 'hover:border-success/40 hover:shadow-glow-green',
    warning: 'hover:border-warning/40 hover:shadow-glow-yellow border-warning/20',
    danger: 'hover:border-danger/40 hover:shadow-glow-red border-danger/20',
  }[status];

  const deltaColor = delta === undefined ? '' : delta > 0 ? 'text-danger' : delta < 0 ? 'text-success' : 'text-foreground-muted';
  const DeltaIcon = delta === undefined ? null : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;

  return (
    <div className={`card-surface p-5 group cursor-default ${statusBorder} transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <span className="section-label">{label}</span>
        {icon && <span className="text-foreground-subtle group-hover:text-primary transition-colors">{icon}</span>}
      </div>

      <div className={`${monospace ? 'metric-value' : 'text-2xl font-bold'} text-foreground mb-1`}>
        {value}
      </div>

      {subValue && (
        <div className="text-xs text-foreground-subtle font-mono mb-2">{subValue}</div>
      )}

      {(delta !== undefined || deltaLabel) && (
        <div className={`flex items-center gap-1 text-xs font-mono ${deltaColor}`}>
          {DeltaIcon && <DeltaIcon className="w-3 h-3" />}
          <span>{deltaLabel ?? (delta !== undefined ? `${delta > 0 ? '+' : ''}${delta.toFixed(2)}` : '')}</span>
        </div>
      )}
    </div>
  );
}

interface StatusBadgeProps {
  level: 'stable' | 'warning' | 'danger';
  label: string;
  large?: boolean;
}

export function StatusBadge({ level, label, large }: StatusBadgeProps) {
  const cls = { stable: 'badge-stable', warning: 'badge-warning', danger: 'badge-danger' }[level];
  return (
    <span className={`${cls} ${large ? 'text-sm px-4 py-1.5' : ''}`}>
      {level === 'danger' ? '● ' : level === 'warning' ? '◆ ' : '✓ '}
      {label}
    </span>
  );
}

interface GaugeBarProps {
  value: number; // 0-100
  label: string;
  thresholds?: { warn: number; danger: number };
}

export function GaugeBar({ value, label, thresholds = { warn: 30, danger: 60 } }: GaugeBarProps) {
  const color = value >= thresholds.danger
    ? 'hsl(var(--danger))'
    : value >= thresholds.warn
    ? 'hsl(var(--warning))'
    : 'hsl(var(--success))';

  const textColor = value >= thresholds.danger
    ? 'text-danger'
    : value >= thresholds.warn
    ? 'text-warning'
    : 'text-success';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-foreground-muted">{label}</span>
        <span className={`text-xs font-mono font-bold ${textColor}`}>{value.toFixed(1)}%</span>
      </div>
      <div className="gauge-track h-2 w-full">
        <div
          className="gauge-fill h-2"
          style={{ width: `${Math.min(value, 100)}%`, background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </div>
  );
}

interface AlertCardProps {
  type: 'danger' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

export function AlertCard({ type, title, message, timestamp }: AlertCardProps) {
  const cls = { danger: 'alert-danger', warning: 'alert-warning', info: 'alert-info' }[type];
  const iconColor = { danger: 'text-danger', warning: 'text-warning', info: 'text-info' }[type];
  const icon = { danger: '⬛', warning: '▲', info: 'ℹ' }[type];

  return (
    <div className={`${cls} p-4 animate-fade-in-up`}>
      <div className="flex items-start gap-3">
        <span className={`text-base mt-0.5 ${iconColor} flex-shrink-0`}>{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground mb-0.5">{title}</div>
          <div className="text-xs text-foreground-muted leading-relaxed">{message}</div>
          <div className="text-[10px] font-mono text-foreground-subtle mt-1.5">
            {timestamp.toLocaleTimeString()} UTC
          </div>
        </div>
      </div>
    </div>
  );
}
