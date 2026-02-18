import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { TopBar } from '../components/dashboard/TopBar';
import { OverviewPage } from '../components/dashboard/OverviewPage';
import { MLObservabilityPage } from '../components/dashboard/MLPage';
import { LLMObservabilityPage } from '../components/dashboard/LLMPage';
import { GovernancePage } from '../components/dashboard/GovernancePage';
import {
  MLMetrics, LLMMetrics, AlertItem,
  calcRiskScore,
  SimulationFlags
} from '../lib/metricsGenerator';

type Page = 'overview' | 'ml' | 'llm' | 'governance';

const PAGE_META: Record<Page, { title: string; subtitle: string }> = {
  overview: { title: 'Executive Command Center', subtitle: 'Real-time unified AI observability across all banking AI systems' },
  ml: { title: 'ML Observability', subtitle: 'Deep model monitoring — drift, bias, accuracy, and inference performance' },
  llm: { title: 'LLM Observability', subtitle: 'Language model telemetry — safety, hallucinations, cost, and latency' },
  governance: { title: 'AI Governance & Compliance', subtitle: 'Responsible AI controls, regulatory compliance, and audit dashboard' },
};

const MAX_HISTORY = 60;

export default function Index() {
  const [page, setPage] = useState<Page>('overview');
  const [mlHistory, setMlHistory] = useState<MLMetrics[]>([]);
  const [llmHistory, setLlmHistory] = useState<LLMMetrics[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const [flags, setFlags] = useState<SimulationFlags>({
    triggerDrift: false,
    triggerHallucination: false,
    triggerCost: false,
    triggerSafety: false,
  });

  const flagsRef = useRef(flags);
  flagsRef.current = flags;

  // hard‑coded example data for deployment (no network calls)
  const STATIC_ML: MLMetrics = {
    accuracy: 0.926,
    precision: 0.908,
    recall: 0.893,
    f1: 0.900,
    driftScore: 0.1,
    biasScore: 0.05,
    latencyMs: 82,
    throughput: 780,
    timestamp: new Date(),
  };

  const STATIC_LLM: LLMMetrics = {
    latencyMs: 680,
    tokenUsage: 420,
    costUsd: 0.0105,
    hallucinationRate: 0.02,
    safetyFlag: false,
    throughputRpm: 92,
    contextLength: 2400,
    timestamp: new Date(),
  };

  const STATIC_ALERTS: AlertItem[] = [
    {
      id: 'static-1',
      type: 'info',
      title: 'Demo Alert',
      message: 'This is a hardcoded alert for deployment.',
      timestamp: new Date(),
      acknowledged: false,
    },
  ];

  const tick = useCallback(() => {
    // simply push the static values (could also rotate or randomize)
    setMlHistory(prev => [...prev.slice(-(MAX_HISTORY - 1)), { ...STATIC_ML, timestamp: new Date() }]);
    setLlmHistory(prev => [...prev.slice(-(MAX_HISTORY - 1)), { ...STATIC_LLM, timestamp: new Date() }]);
    setAlerts(prev => {
      const combined = [...STATIC_ALERTS, ...prev].slice(0, 40);
      return combined;
    });
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    // Initial data
    tick();
    const interval = setInterval(tick, 3000);
    return () => clearInterval(interval);
  }, [tick]);

  const latestML = mlHistory[mlHistory.length - 1];
  const latestLLM = llmHistory[llmHistory.length - 1];
  const { score, level } = latestML && latestLLM
    ? calcRiskScore(latestML, latestLLM)
    : { score: 0, level: 'LOW' as const };

  const meta = PAGE_META[page];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        triggerDrift={flags.triggerDrift}
        triggerHallucination={flags.triggerHallucination}
        triggerCost={flags.triggerCost}
        triggerSafety={flags.triggerSafety}
        onToggleDrift={() => setFlags(f => ({ ...f, triggerDrift: !f.triggerDrift }))}
        onToggleHallucination={() => setFlags(f => ({ ...f, triggerHallucination: !f.triggerHallucination }))}
        onToggleCost={() => setFlags(f => ({ ...f, triggerCost: !f.triggerCost }))}
        onToggleSafety={() => setFlags(f => ({ ...f, triggerSafety: !f.triggerSafety }))}
        alertCount={alerts.length}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          pageTitle={meta.title}
          pageSubtitle={meta.subtitle}
          onRefresh={tick}
          lastUpdate={lastUpdate}
          alertCount={alerts.length}
          riskLevel={level}
          riskScore={score}
        />

        <main className="flex-1 overflow-y-auto">
          {page === 'overview' && (
            <OverviewPage mlHistory={mlHistory} llmHistory={llmHistory} alerts={alerts} />
          )}
          {page === 'ml' && (
            <MLObservabilityPage mlHistory={mlHistory} />
          )}
          {page === 'llm' && (
            <LLMObservabilityPage llmHistory={llmHistory} />
          )}
          {page === 'governance' && (
            <GovernancePage alerts={alerts} mlHistory={mlHistory} llmHistory={llmHistory} />
          )}
        </main>
      </div>
    </div>
  );
}
