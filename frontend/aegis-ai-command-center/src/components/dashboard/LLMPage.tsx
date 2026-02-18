import React from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { MessageSquare, DollarSign, Clock, ShieldAlert, Cpu, Layers } from 'lucide-react';
import { LLMMetrics, getLLMStatus } from '../../lib/metricsGenerator';
import { KpiCard, StatusBadge, GaugeBar } from './Widgets';

const C = {
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

function SafetyMeter({ compliant }: { compliant: boolean }) {
  return (
    <div className={`rounded-xl border-2 p-5 text-center ${compliant ? 'border-success/50 bg-success/5' : 'border-danger/50 bg-danger/5'}`}>
      <div className={`text-4xl mb-2 ${compliant ? '' : 'animate-pulse'}`}>
        {compliant ? '🛡️' : '🚨'}
      </div>
      <div className={`text-lg font-bold font-mono ${compliant ? 'text-success' : 'text-danger'}`}>
        {compliant ? 'COMPLIANT' : 'VIOLATION'}
      </div>
      <div className="text-xs text-foreground-muted mt-1">Content Safety Status</div>
    </div>
  );
}

interface LLMPageProps {
  llmHistory: LLMMetrics[];
}

export function LLMObservabilityPage({ llmHistory }: LLMPageProps) {
  const latest = llmHistory[llmHistory.length - 1];
  if (!latest) return <div className="p-8 text-foreground-muted font-mono">Collecting LLM telemetry...</div>;

  const { label, level } = getLLMStatus(latest);

  const chartData = llmHistory.slice(-50).map((m, i) => ({
    i,
    latency: +m.latencyMs.toFixed(0),
    tokens: m.tokenUsage,
    cost: +(m.costUsd * 100).toFixed(3),
    halluc: +(m.hallucinationRate * 100).toFixed(2),
    throughput: +m.throughputRpm.toFixed(1),
    ctx: m.contextLength,
  }));

  const cumulativeCost = chartData.reduce<typeof chartData>((acc, d, i) => {
    const prev = i > 0 ? acc[i - 1].cost : 0;
    acc.push({ ...d, cost: +(prev + d.cost).toFixed(3) });
    return acc;
  }, []);

  const tableData = llmHistory.slice(-12).reverse().map((m) => ({
    time: m.timestamp.toLocaleTimeString(),
    latency: m.latencyMs.toFixed(0) + 'ms',
    tokens: m.tokenUsage.toString(),
    cost: '$' + m.costUsd.toFixed(5),
    halluc: (m.hallucinationRate * 100).toFixed(2) + '%',
    ctx: m.contextLength.toString(),
    safety: m.safetyFlag ? 'danger' : 'stable',
  }));

  const compliance = !latest.safetyFlag;
  const complianceScore = compliance ? Math.max(60, 100 - (latest.hallucinationRate * 300)) : 25;

  return (
    <div className="p-6 space-y-6">
      {/* Status */}
      <div className="flex flex-wrap items-center gap-4">
        <StatusBadge level={level} label={label} large />
        <span className="text-xs font-mono text-foreground-subtle">
          Banking Chatbot · Loan Advisor · Compliance Q&A · Document Summarizer — 4 LLMs active
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="RESPONSE LATENCY" value={`${latest.latencyMs.toFixed(0)}ms`}
          status={latest.latencyMs > 2000 ? 'danger' : latest.latencyMs > 1200 ? 'warning' : 'stable'}
          icon={<Clock className="w-4 h-4" />} />
        <KpiCard label="TOKENS / CALL" value={`${latest.tokenUsage}`}
          deltaLabel={`~${latest.contextLength} ctx tokens`}
          status={latest.tokenUsage > 1500 ? 'warning' : 'stable'} icon={<Layers className="w-4 h-4" />} />
        <KpiCard label="COST / CALL" value={`$${latest.costUsd.toFixed(5)}`}
          deltaLabel={`~$${(latest.costUsd * 8640).toFixed(2)}/day`}
          status={latest.costUsd > 0.08 ? 'warning' : 'stable'} icon={<DollarSign className="w-4 h-4" />} />
        <KpiCard label="THROUGHPUT" value={`${latest.throughputRpm.toFixed(1)} RPM`}
          status={latest.throughputRpm < 20 ? 'warning' : 'stable'} icon={<Cpu className="w-4 h-4" />} />
      </div>

      {/* Safety Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-surface-static p-6">
          <SectionHeader title="Safety Status" />
          <SafetyMeter compliant={compliance} />
          <div className="mt-4 space-y-3">
            <GaugeBar value={latest.hallucinationRate * 100} label="Hallucination Rate" thresholds={{ warn: 8, danger: 15 }} />
            <GaugeBar value={complianceScore} label="Compliance Score" thresholds={{ warn: 70, danger: 50 }} />
            <GaugeBar value={Math.min((latest.latencyMs / 3000) * 100, 100)} label="Latency Pressure" thresholds={{ warn: 40, danger: 70 }} />
          </div>
        </div>

        <div className="card-surface-static p-6 lg:col-span-2">
          <SectionHeader title="Hallucination Rate" badge={
            <span className={latest.hallucinationRate > 0.15 ? 'badge-danger' : 'badge-stable'}>
              {(latest.hallucinationRate * 100).toFixed(2)}%
            </span>
          } />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="hallucGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.red} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 12%)" />
              <XAxis dataKey="i" hide />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}%`, 'Hallucination']} />
              <Area type="monotone" dataKey="halluc" stroke={C.red} fill="url(#hallucGrad)" strokeWidth={2.5} dot={false} name="Halluc %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface-static p-5">
          <SectionHeader title="Cumulative Cost (Session)" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={cumulativeCost}>
              <defs>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.yellow} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.yellow} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 12%)" />
              <XAxis dataKey="i" hide />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`$${v}`, 'Cost (×100)']} />
              <Area type="monotone" dataKey="cost" stroke={C.yellow} fill="url(#costGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-surface-static p-5">
          <SectionHeader title="Latency & Throughput" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 12%)" />
              <XAxis dataKey="i" hide />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
              <Line type="monotone" dataKey="latency" stroke={C.blue} strokeWidth={2} dot={false} name="Latency ms" />
              <Line type="monotone" dataKey="throughput" stroke={C.cyan} strokeWidth={2} dot={false} name="RPM" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interaction Log */}
      <div className="card-surface-static overflow-hidden">
        <div className="p-5 border-b border-border">
          <SectionHeader title="LLM Interaction Log" />
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                {['Time', 'Latency', 'Tokens', 'Cost', 'Halluc %', 'Context', 'Safety'].map(h => (
                  <th key={h} className="text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i}>
                  <td>{row.time}</td>
                  <td>{row.latency}</td>
                  <td>{row.tokens}</td>
                  <td>{row.cost}</td>
                  <td className={row.halluc > '15.00%' ? 'text-danger' : 'text-foreground'}>{row.halluc}</td>
                  <td>{row.ctx}</td>
                  <td>
                    <StatusBadge
                      level={row.safety as 'stable' | 'danger'}
                      label={row.safety === 'danger' ? 'UNSAFE' : 'SAFE'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
