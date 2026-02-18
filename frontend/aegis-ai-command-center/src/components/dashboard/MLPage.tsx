import React from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { Activity, Target, Zap, Clock, TrendingDown, Shield } from 'lucide-react';
import { MLMetrics, getMLStatus } from '../../lib/metricsGenerator';
import { KpiCard, StatusBadge, GaugeBar } from './Widgets';

const CHART_COLORS = {
  blue: 'hsl(215, 100%, 52%)',
  green: 'hsl(134, 60%, 43%)',
  yellow: 'hsl(44, 90%, 52%)',
  red: 'hsl(354, 80%, 55%)',
  cyan: 'hsl(190, 85%, 50%)',
};

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(220, 25%, 8%)',
    border: '1px solid hsl(220, 18%, 16%)',
    borderRadius: '8px',
    fontSize: '11px',
    fontFamily: 'JetBrains Mono, monospace',
    color: 'hsl(210, 30%, 92%)',
  },
};
const axisStyle = { stroke: 'hsl(215, 12%, 38%)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' };

function SectionHeader({ title, badge }: { title: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-primary rounded-full" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {badge}
    </div>
  );
}

function CircularGauge({ value, max = 100, label, color }: { value: number; max?: number; label: string; color: string }) {
  const pct = Math.min(value / max, 1);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <svg width="130" height="130" className="-rotate-90">
        <circle cx="65" cy="65" r={r} fill="none" stroke="hsl(220, 18%, 14%)" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="text-center -mt-2">
        <div className="metric-value-sm text-foreground">{value.toFixed(1)}{max === 100 ? '%' : 'ms'}</div>
        <div className="section-label">{label}</div>
      </div>
    </div>
  );
}

interface MLPageProps {
  mlHistory: MLMetrics[];
}

export function MLObservabilityPage({ mlHistory }: MLPageProps) {
  const latest = mlHistory[mlHistory.length - 1];
  if (!latest) return <div className="p-8 text-foreground-muted font-mono">Collecting ML telemetry...</div>;

  const { label, level } = getMLStatus(latest);

  const chartData = mlHistory.slice(-50).map((m, i) => ({
    i,
    accuracy: +(m.accuracy * 100).toFixed(2),
    precision: +(m.precision * 100).toFixed(2),
    recall: +(m.recall * 100).toFixed(2),
    f1: +(m.f1 * 100).toFixed(2),
    drift: +(m.driftScore * 100).toFixed(2),
    bias: +(m.biasScore * 100).toFixed(2),
    latency: +m.latencyMs.toFixed(0),
    throughput: +m.throughput.toFixed(0),
  }));

  const tableData = mlHistory.slice(-12).reverse().map((m) => ({
    time: m.timestamp.toLocaleTimeString(),
    acc: (m.accuracy * 100).toFixed(2) + '%',
    prec: (m.precision * 100).toFixed(2) + '%',
    recall: (m.recall * 100).toFixed(2) + '%',
    f1: (m.f1 * 100).toFixed(2) + '%',
    drift: (m.driftScore * 100).toFixed(1) + '%',
    bias: (m.biasScore * 100).toFixed(1) + '%',
    lat: m.latencyMs.toFixed(0) + 'ms',
    status: m.driftScore > 0.45 ? 'danger' : m.driftScore > 0.25 ? 'warning' : 'stable',
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header + Status */}
      <div className="flex flex-wrap items-center gap-4">
        <StatusBadge level={level} label={label} large />
        <span className="text-xs font-mono text-foreground-subtle">
          Fraud Detection · Credit Scoring · AML · KYC — 4 active models
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="ACCURACY" value={`${(latest.accuracy * 100).toFixed(2)}%`}
          status={latest.accuracy < 0.82 ? 'danger' : 'stable'} icon={<Target className="w-4 h-4" />} />
        <KpiCard label="PRECISION" value={`${(latest.precision * 100).toFixed(2)}%`}
          status={latest.precision < 0.80 ? 'danger' : 'stable'} icon={<Shield className="w-4 h-4" />} />
        <KpiCard label="RECALL" value={`${(latest.recall * 100).toFixed(2)}%`}
          status={latest.recall < 0.80 ? 'danger' : 'stable'} icon={<Activity className="w-4 h-4" />} />
        <KpiCard label="F1 SCORE" value={`${(latest.f1 * 100).toFixed(2)}%`}
          status={latest.f1 < 0.80 ? 'danger' : 'stable'} icon={<TrendingDown className="w-4 h-4" />} />
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface-static p-6">
          <SectionHeader title="Data Drift Indicators" />
          <div className="grid grid-cols-2 gap-6 mb-4">
            <CircularGauge
              value={+(latest.driftScore * 100).toFixed(1)}
              label="PSI DRIFT"
              color={latest.driftScore > 0.45 ? CHART_COLORS.red : latest.driftScore > 0.25 ? CHART_COLORS.yellow : CHART_COLORS.green}
            />
            <CircularGauge
              value={+(latest.biasScore * 100).toFixed(1)}
              label="BIAS SCORE"
              color={latest.biasScore > 0.15 ? CHART_COLORS.yellow : CHART_COLORS.cyan}
            />
          </div>
          <div className="space-y-3 mt-4">
            <GaugeBar value={latest.driftScore * 100} label="Population Stability Index" thresholds={{ warn: 25, danger: 45 }} />
            <GaugeBar value={latest.biasScore * 100} label="Demographic Parity Gap" thresholds={{ warn: 10, danger: 20 }} />
            <GaugeBar value={(1 - latest.accuracy) * 100} label="Error Rate" thresholds={{ warn: 10, danger: 20 }} />
          </div>
        </div>

        <div className="card-surface-static p-6">
          <SectionHeader title="Inference Performance" />
          <div className="grid grid-cols-2 gap-6 mb-4">
            <CircularGauge
              value={+latest.latencyMs.toFixed(0)}
              max={300}
              label="LATENCY MS"
              color={latest.latencyMs > 200 ? CHART_COLORS.red : latest.latencyMs > 120 ? CHART_COLORS.yellow : CHART_COLORS.green}
            />
            <CircularGauge
              value={+(latest.throughput / 12).toFixed(0)}
              max={100}
              label="THROUGHPUT %"
              color={CHART_COLORS.blue}
            />
          </div>
          <div className="space-y-3 mt-4">
            <GaugeBar value={Math.min((latest.latencyMs / 300) * 100, 100)} label="Latency Utilization" thresholds={{ warn: 40, danger: 70 }} />
            <GaugeBar value={(latest.throughput / 1200) * 100} label="Throughput Capacity" thresholds={{ warn: 80, danger: 95 }} />
          </div>
        </div>
      </div>

      {/* Performance trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface-static p-5">
          <SectionHeader title="Classification Metrics Over Time" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 12%)" />
              <XAxis dataKey="i" hide />
              <YAxis domain={[60, 100]} tick={axisStyle} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
              <ReferenceLine y={85} stroke="hsl(354, 80%, 55%)" strokeDasharray="4 4" opacity={0.5} />
              <Line type="monotone" dataKey="accuracy" stroke={CHART_COLORS.green} strokeWidth={2} dot={false} name="Accuracy %" />
              <Line type="monotone" dataKey="precision" stroke={CHART_COLORS.blue} strokeWidth={2} dot={false} name="Precision %" />
              <Line type="monotone" dataKey="recall" stroke={CHART_COLORS.yellow} strokeWidth={2} dot={false} name="Recall %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card-surface-static p-5">
          <SectionHeader title="Drift & Latency Trends" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="driftGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.yellow} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.yellow} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 12%)" />
              <XAxis dataKey="i" hide />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
              <ReferenceLine y={25} stroke={CHART_COLORS.yellow} strokeDasharray="4 4" opacity={0.5} />
              <Area type="monotone" dataKey="drift" stroke={CHART_COLORS.yellow} fill="url(#driftGrad)" dot={false} name="Drift %" strokeWidth={2} />
              <Line type="monotone" dataKey="bias" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={false} name="Bias %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="card-surface-static overflow-hidden">
        <div className="p-5 border-b border-border">
          <SectionHeader title="Recent Inference Log" />
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                {['Time', 'Accuracy', 'Precision', 'Recall', 'F1', 'Drift', 'Bias', 'Latency', 'Status'].map(h => (
                  <th key={h} className="text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i}>
                  <td>{row.time}</td>
                  <td>{row.acc}</td>
                  <td>{row.prec}</td>
                  <td>{row.recall}</td>
                  <td>{row.f1}</td>
                  <td className={row.status === 'danger' ? 'text-danger' : row.status === 'warning' ? 'text-warning' : 'text-success'}>{row.drift}</td>
                  <td>{row.bias}</td>
                  <td>{row.lat}</td>
                  <td><StatusBadge level={row.status as 'stable' | 'warning' | 'danger'} label={row.status === 'stable' ? 'Stable' : row.status === 'warning' ? 'Warning' : 'High Risk'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
