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
  SimulationFlags,
  generateMLMetrics,
  generateLLMMetrics,
  generateAlerts,
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

  // simulation tick uses generator functions; flags drive behaviour
  const tick = useCallback(() => {
    const f = flagsRef.current;
    const ml = generateMLMetrics(f);
    const llm = generateLLMMetrics(f);
    const newAlerts = generateAlerts(ml, llm);

    setMlHistory(prev => [...prev.slice(-(MAX_HISTORY - 1)), ml]);
    setLlmHistory(prev => [...prev.slice(-(MAX_HISTORY - 1)), llm]);
    setAlerts(prev => {
      const combined = [...newAlerts, ...prev].slice(0, 40);
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
