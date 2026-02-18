import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Activity, Cpu, DollarSign, Layers, TrendingUp, AlertTriangle, Target, Zap } from 'lucide-react';
import { MLMetrics, LLMMetrics, calcRiskScore } from '../../lib/metricsGenerator';
import { KpiCard, StatusBadge, GaugeBar, AlertCard } from './Widgets';
import { AlertItem } from '../../lib/metricsGenerator';

const CHART_COLORS = {
  blue: 'hsl(215, 100%, 52%)',
  green: 'hsl(134, 60%, 43%)',
  yellow: 'hsl(44, 90%, 52%)',
  red: 'hsl(354, 80%, 55%)',
  cyan: 'hsl(190, 85%, 50%)',
  purple: 'hsl(265, 70%, 60%)',
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
  labelStyle: { color: 'hsl(215, 12%, 55%)' },
};

const axisStyle = {
  stroke: 'hsl(215, 12%, 38%)',
  fontSize: 10,
  fontFamily: 'JetBrains Mono, monospace',
};

function SectionHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-primary rounded-full" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

interface OverviewPageProps {
  mlHistory: MLMetrics[];
  llmHistory: LLMMetrics[];
  alerts: AlertItem[];
}

export function OverviewPage({ mlHistory, llmHistory, alerts }: OverviewPageProps) {
  const latestML = mlHistory[mlHistory.length - 1];
  const latestLLM = llmHistory[llmHistory.length - 1];

  if (!latestML || !latestLLM) {
    return <div className="p-8 text-foreground-muted font-mono">Initializing telemetry...</div>;
  }

  const { score, level } = calcRiskScore(latestML, latestLLM);

  // Build chart data
  const mlChartData = mlHistory.slice(-40).map((m, i) => ({
    t: i,
    accuracy: +(m.accuracy * 100).toFixed(2),
    drift: +(m.driftScore * 100).toFixed(2),
    latency: +m.latencyMs.toFixed(0),
  }));

  const llmChartData = llmHistory.slice(-40).map((m, i) => ({
    t: i,
    tokens: m.tokenUsage,
    cost: +(m.costUsd * 1000).toFixed(2),
    hallucination: +(m.hallucinationRate * 100).toFixed(2),
  }));

  const riskClass = { LOW: 'risk-low', MEDIUM: 'risk-medium', HIGH: 'risk-high' }[level];
  const activeAlerts = alerts.slice(0, 6);

  return (
    <div className="p-6 space-y-6">
      {/* Global Risk Banner */}
      <div className={`${riskClass} flex items-center justify-between px-6 py-4 rounded-xl`}>
        <div className="flex items-center gap-4">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div>
            <div className="text-lg font-bold tracking-wide">System Risk: {level}</div>
            <div className="text-xs font-mono opacity-75">Composite risk score across all AI components</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-bold">{score}</div>
          <div className="text-xs font-mono opacity-60">/100</div>
        </div>
      </div>

      {/* KPI Grid */}
      <div>
        <SectionHeader title="Key Performance Indicators" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="ML ACCURACY"
            value={`${(latestML.accuracy * 100).toFixed(2)}%`}
            delta={latestML.accuracy - 0.926}
            deltaLabel={`vs 92.6% baseline`}
            status={latestML.accuracy < 0.82 ? 'danger' : latestML.accuracy < 0.88 ? 'warning' : 'stable'}
            icon={<Target className="w-4 h-4" />}
          />
          <KpiCard
            label="DRIFT SCORE (PSI)"
            value={`${(latestML.driftScore * 100).toFixed(1)}%`}
            deltaLabel={latestML.driftScore > 0.3 ? '⚑ Above threshold' : '✓ Within bounds'}
            status={latestML.driftScore > 0.45 ? 'danger' : latestML.driftScore > 0.25 ? 'warning' : 'stable'}
            icon={<Activity className="w-4 h-4" />}
          />
          <KpiCard
            label="LLM LATENCY"
            value={`${latestLLM.latencyMs.toFixed(0)}ms`}
            deltaLabel={latestLLM.latencyMs > 2000 ? '⚑ SLA breach' : `SLA: 2000ms`}
            status={latestLLM.latencyMs > 2000 ? 'danger' : latestLLM.latencyMs > 1500 ? 'warning' : 'stable'}
            icon={<Cpu className="w-4 h-4" />}
          />
          <KpiCard
            label="EST. DAILY COST"
            value={`$${(latestLLM.costUsd * 8640).toFixed(2)}`}
            deltaLabel={`${latestLLM.tokenUsage} tokens/call`}
            status={latestLLM.costUsd > 0.08 ? 'warning' : 'stable'}
            icon={<DollarSign className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="F1 SCORE" value={`${(latestML.f1 * 100).toFixed(2)}%`} status="stable" icon={<TrendingUp className="w-4 h-4" />} />
        <KpiCard label="THROUGHPUT" value={`${latestML.throughput.toFixed(0)}/s`} status="stable" icon={<Zap className="w-4 h-4" />} />
        <KpiCard label="HALLUCINATION" value={`${(latestLLM.hallucinationRate * 100).toFixed(2)}%`}
          status={latestLLM.hallucinationRate > 0.15 ? 'danger' : latestLLM.hallucinationRate > 0.08 ? 'warning' : 'stable'}
          icon={<AlertTriangle className="w-4 h-4" />} />
        <KpiCard label="TOKENS/CALL" value={`${latestLLM.tokenUsage}`} status="stable" icon={<Layers className="w-4 h-4" />} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface-static p-5">
          <SectionHeader title="Model Accuracy Trend" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mlChartData}>
              <defs>
                <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 14%)" />
              <XAxis dataKey="t" hide />
              <YAxis domain={[60, 100]} tick={axisStyle} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}%`, 'Accuracy']} />
              <Area type="monotone" dataKey="accuracy" stroke={CHART_COLORS.green} strokeWidth={2}
                fill="url(#accGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-surface-static p-5">
          <SectionHeader title="LLM Token Usage" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={llmChartData.slice(-20)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 14%)" />
              <XAxis dataKey="t" hide />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [v, 'Tokens']} />
              <Bar dataKey="tokens" fill={CHART_COLORS.blue} radius={[2, 2, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface-static p-5">
          <SectionHeader title="Drift & Hallucination" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mlChartData.map((d, i) => ({ ...d, halluc: llmChartData[i]?.hallucination ?? 0 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 14%)" />
              <XAxis dataKey="t" hide />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
              <Line type="monotone" dataKey="drift" stroke={CHART_COLORS.yellow} strokeWidth={2} dot={false} name="Drift %" />
              <Line type="monotone" dataKey="halluc" stroke={CHART_COLORS.red} strokeWidth={2} dot={false} name="Halluc %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        <div className="card-surface-static p-5">
          <SectionHeader title="Active Alerts">
            <span className="badge-danger text-[10px]">{activeAlerts.length} ACTIVE</span>
          </SectionHeader>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {activeAlerts.length === 0 ? (
              <div className="text-sm text-foreground-subtle font-mono text-center py-6">
                ✓ No active alerts
              </div>
            ) : (
              activeAlerts.map((a, i) => (
                <AlertCard key={i} type={a.type} title={a.title} message={a.message} timestamp={a.timestamp} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
