import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { ShieldCheck, Users, FileText, BookOpen, GitMerge, AlertTriangle, CheckCircle2, XCircle, Scale } from 'lucide-react';
import { MLMetrics, LLMMetrics, AlertItem } from '../../lib/metricsGenerator';
import { KpiCard, AlertCard } from './Widgets';

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

interface ComplianceRowProps {
  label: string;
  status: 'pass' | 'warn' | 'fail';
  score: string;
  owner: string;
  lastAudit: string;
}

function ComplianceRow({ label, status, score, owner, lastAudit }: ComplianceRowProps) {
  const icon = status === 'pass' ? <CheckCircle2 className="w-4 h-4 text-success" /> :
               status === 'warn' ? <AlertTriangle className="w-4 h-4 text-warning" /> :
               <XCircle className="w-4 h-4 text-danger" />;
  const badge = status === 'pass' ? 'badge-stable' : status === 'warn' ? 'badge-warning' : 'badge-danger';
  const lbl = status === 'pass' ? 'PASS' : status === 'warn' ? 'WARN' : 'FAIL';
  return (
    <tr>
      <td>
        <div className="flex items-center gap-2">{icon} {label}</div>
      </td>
      <td><span className={badge}>{lbl}</span></td>
      <td>{score}</td>
      <td className="text-foreground-muted">{owner}</td>
      <td className="text-foreground-subtle">{lastAudit}</td>
    </tr>
  );
}

const RADAR_COLORS = {
  stroke: 'hsl(215, 100%, 52%)',
  fill: 'hsl(215, 100%, 52%)',
};

interface GovernancePageProps {
  alerts: AlertItem[];
  mlHistory: MLMetrics[];
  llmHistory: LLMMetrics[];
}

export function GovernancePage({ alerts, mlHistory, llmHistory }: GovernancePageProps) {
  const latestML = mlHistory[mlHistory.length - 1];
  const latestLLM = llmHistory[llmHistory.length - 1];

  const radarData = [
    { subject: 'Accuracy', score: latestML ? +(latestML.accuracy * 100).toFixed(1) : 90 },
    { subject: 'Fairness', score: latestML ? +(100 - latestML.biasScore * 500).toFixed(1) : 85 },
    { subject: 'Safety', score: latestLLM ? (latestLLM.safetyFlag ? 30 : +(100 - latestLLM.hallucinationRate * 300).toFixed(1)) : 95 },
    { subject: 'Privacy', score: 96 },
    { subject: 'Explainability', score: 88 },
    { subject: 'Robustness', score: latestML ? +(100 - latestML.driftScore * 100).toFixed(1) : 90 },
  ];

  const escalationData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    escalations: Math.round(Math.random() * 8 + 2),
    approved: Math.round(Math.random() * 120 + 40),
    rejected: Math.round(Math.random() * 5),
  }));

  const frameworks = [
    { icon: '🇪🇺', name: 'EU AI Act', status: 'Compliant', color: 'text-success' },
    { icon: '🏦', name: 'Basel IV', status: 'Compliant', color: 'text-success' },
    { icon: '🔒', name: 'GDPR', status: 'Compliant', color: 'text-success' },
    { icon: '📋', name: 'SR 11-7', status: 'Monitoring', color: 'text-warning' },
    { icon: '⚖️', name: 'Fair Lending', status: 'Compliant', color: 'text-success' },
    { icon: '🛡️', name: 'ISO 42001', status: 'In Progress', color: 'text-info' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="AUDIT LOGS (24H)" value="12,547" deltaLabel="+256 today" icon={<FileText className="w-4 h-4" />} />
        <KpiCard label="HUMAN REVIEWS" value="98.2%" deltaLabel="+1.2% this week" icon={<Users className="w-4 h-4" />} />
        <KpiCard label="POLICY VIOLATIONS" value="0" deltaLabel="All clear ✓" status="stable" icon={<BookOpen className="w-4 h-4" />} />
        <KpiCard label="ESCALATIONS (24H)" value="12" deltaLabel="+3 vs yesterday" status="warning" icon={<GitMerge className="w-4 h-4" />} />
      </div>

      {/* Alerts + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <div className="card-surface-static p-5">
          <SectionHeader
            title="Active Incidents"
            badge={<span className={alerts.length > 0 ? 'badge-danger' : 'badge-stable'}>{alerts.length} ACTIVE</span>}
          />
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
                <div className="text-sm text-foreground-muted font-mono">All systems compliant</div>
                <div className="text-xs text-foreground-subtle mt-1">No active governance incidents</div>
              </div>
            ) : (
              alerts.map((a, i) => (
                <AlertCard key={i} type={a.type} title={a.title} message={a.message} timestamp={a.timestamp} />
              ))
            )}
          </div>
        </div>

        {/* Responsible AI Radar */}
        <div className="card-surface-static p-5">
          <SectionHeader title="Responsible AI Scorecard" />
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(220, 18%, 16%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(215, 12%, 55%)', fontFamily: 'JetBrains Mono' }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Score" dataKey="score" stroke={RADAR_COLORS.stroke} fill={RADAR_COLORS.fill} fillOpacity={0.15} strokeWidth={2} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}%`, 'Score']} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regulatory Frameworks */}
      <div className="card-surface-static p-5">
        <SectionHeader title="Regulatory Compliance Status" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {frameworks.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-surface-2 border border-border rounded-lg px-4 py-3">
              <span className="text-xl">{f.icon}</span>
              <div>
                <div className="text-sm font-semibold text-foreground">{f.name}</div>
                <div className={`text-xs font-mono ${f.color}`}>{f.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HITL Escalation Trends */}
      <div className="card-surface-static p-5">
        <SectionHeader title="Human-in-the-Loop Escalation Trends (30d)" />
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={escalationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 12%)" />
            <XAxis dataKey="day" tick={axisStyle} tickLine={false} label={{ value: 'Day', position: 'insideBottom', fill: 'hsl(215, 12%, 38%)', fontSize: 10 }} />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="escalations" stroke="hsl(44, 90%, 52%)" strokeWidth={2} dot={false} name="Escalations" />
            <Line type="monotone" dataKey="rejected" stroke="hsl(354, 80%, 55%)" strokeWidth={2} dot={false} name="Rejected" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Compliance Metrics Table */}
      <div className="card-surface-static overflow-hidden">
        <div className="p-5 border-b border-border">
          <SectionHeader title="Compliance Metrics Dashboard" />
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                {['Control', 'Status', 'Score', 'Owner', 'Last Audit'].map(h => (
                  <th key={h} className="text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <ComplianceRow label="Data Privacy & PII Protection" status="pass" score="100%" owner="DataOps" lastAudit="Today" />
              <ComplianceRow label="Model Explainability (SHAP/LIME)" status="pass" score="94.2%" owner="MLOps" lastAudit="Today" />
              <ComplianceRow label="Demographic Fairness" status={latestML && latestML.biasScore > 0.15 ? 'warn' : 'pass'} score={latestML ? `${(100 - latestML.biasScore * 500).toFixed(1)}%` : '91%'} owner="Risk" lastAudit="Today" />
              <ComplianceRow label="Content Safety & Toxicity" status={latestLLM && latestLLM.safetyFlag ? 'fail' : 'pass'} score={latestLLM && latestLLM.safetyFlag ? '25%' : '98.1%'} owner="LLMOps" lastAudit="Today" />
              <ComplianceRow label="Audit Trail Completeness" status="pass" score="100%" owner="SecOps" lastAudit="Today" />
              <ComplianceRow label="Model Drift Monitoring" status={latestML && latestML.driftScore > 0.4 ? 'fail' : latestML && latestML.driftScore > 0.25 ? 'warn' : 'pass'} score={latestML ? `${(100 - latestML.driftScore * 100).toFixed(1)}%` : '92%'} owner="MLOps" lastAudit="Real-time" />
              <ComplianceRow label="Adversarial Robustness" status="pass" score="91.4%" owner="AI Security" lastAudit="Yesterday" />
            </tbody>
          </table>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { icon: <Scale className="w-5 h-5 text-primary" />, title: 'Bias Monitoring', desc: 'Real-time fairness tracking across protected demographics with automated parity checks.' },
          { icon: <ShieldCheck className="w-5 h-5 text-success" />, title: 'Safety Enforcement', desc: 'Automated content filters, rate limiting on sensitive ops, and toxicity classifiers.' },
          { icon: <Users className="w-5 h-5 text-warning" />, title: 'Human-in-the-Loop', desc: 'Critical decisions route to human reviewers with full audit trail and escalation SLAs.' },
        ].map((item, i) => (
          <div key={i} className="card-surface-static p-5">
            <div className="flex items-center gap-3 mb-3">
              {item.icon}
              <div className="text-sm font-semibold text-foreground">{item.title}</div>
            </div>
            <p className="text-xs text-foreground-muted leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
