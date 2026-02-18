export interface MLMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  driftScore: number;
  biasScore: number;
  latencyMs: number;
  throughput: number;
  timestamp: Date;
}

export interface LLMMetrics {
  latencyMs: number;
  tokenUsage: number;
  costUsd: number;
  hallucinationRate: number;
  safetyFlag: boolean;
  throughputRpm: number;
  contextLength: number;
  timestamp: Date;
}

export interface AlertItem {
  id: string;
  type: 'danger' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface SimulationFlags {
  triggerDrift: boolean;
  triggerHallucination: boolean;
  triggerCost: boolean;
  triggerSafety: boolean;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function randn(mean: number, std: number) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * std;
}

export function generateMLMetrics(flags: SimulationFlags): MLMetrics {
  const drift = flags.triggerDrift;
  const accuracy = clamp(randn(drift ? 0.77 : 0.926, drift ? 0.04 : 0.008), 0.6, 0.999);
  const precision = clamp(randn(drift ? 0.74 : 0.908, drift ? 0.05 : 0.01), 0.6, 0.999);
  const recall = clamp(randn(drift ? 0.73 : 0.893, drift ? 0.05 : 0.01), 0.6, 0.999);
  const f1 = (2 * precision * recall) / (precision + recall);
  const driftScore = clamp(
    drift ? 0.45 + Math.random() * 0.4 : 0.08 + Math.random() * 0.12,
    0,
    1
  );
  const biasScore = clamp(0.04 + Math.random() * 0.12, 0, 1);
  const latencyMs = clamp(randn(drift ? 210 : 82, drift ? 40 : 15), 30, 500);
  const throughput = clamp(randn(drift ? 320 : 780, 60), 100, 1200);

  return { accuracy, precision, recall, f1, driftScore, biasScore, latencyMs, throughput, timestamp: new Date() };
}

export function generateLLMMetrics(flags: SimulationFlags): LLMMetrics {
  const attack = flags.triggerHallucination || flags.triggerSafety;
  const highCost = flags.triggerCost;

  const latencyMs = clamp(randn(attack ? 2200 : 680, attack ? 400 : 120), 200, 5000);
  const tokenUsage = clamp(
    Math.round(randn(highCost ? 1800 : 420, highCost ? 300 : 120)),
    50,
    4096
  );
  const costUsd = (tokenUsage / 1000) * (highCost ? 0.06 : 0.025);
  const hallucinationRate = clamp(
    attack ? 0.22 + Math.random() * 0.25 : 0.02 + Math.random() * 0.05,
    0,
    1
  );
  const safetyFlag = flags.triggerSafety || (attack && Math.random() < hallucinationRate);
  const throughputRpm = clamp(randn(attack ? 28 : 92, 12), 5, 200);
  const contextLength = Math.round(clamp(randn(2400, 800), 512, 8192));

  return { latencyMs, tokenUsage, costUsd, hallucinationRate, safetyFlag, throughputRpm, contextLength, timestamp: new Date() };
}

export function getMLStatus(m: MLMetrics): { label: string; level: 'stable' | 'warning' | 'danger' } {
  if (m.driftScore > 0.45) return { label: 'High Risk', level: 'danger' };
  if (m.driftScore > 0.25 || m.accuracy < 0.82) return { label: 'Warning', level: 'warning' };
  return { label: 'Stable', level: 'stable' };
}

export function getLLMStatus(m: LLMMetrics): { label: string; level: 'stable' | 'warning' | 'danger' } {
  if (m.safetyFlag || m.hallucinationRate > 0.2) return { label: 'Unsafe', level: 'danger' };
  if (m.latencyMs > 2000 || m.hallucinationRate > 0.1) return { label: 'Degraded', level: 'warning' };
  return { label: 'Safe', level: 'stable' };
}

export function calcRiskScore(ml: MLMetrics, llm: LLMMetrics): { score: number; level: 'LOW' | 'MEDIUM' | 'HIGH' } {
  let score = 0;
  if (ml.driftScore > 0.45) score += 35;
  else if (ml.driftScore > 0.25) score += 18;
  if (ml.accuracy < 0.8) score += 20;
  if (ml.biasScore > 0.15) score += 10;
  if (llm.safetyFlag || llm.hallucinationRate > 0.2) score += 35;
  else if (llm.hallucinationRate > 0.1) score += 18;
  if (llm.latencyMs > 2500) score += 10;
  score = Math.min(score, 100);
  const level = score >= 60 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW';
  return { score, level };
}

export function generateAlerts(ml: MLMetrics, llm: LLMMetrics): AlertItem[] {
  const alerts: AlertItem[] = [];
  const ts = new Date();

  if (ml.driftScore > 0.4) {
    alerts.push({
      id: `drift-${ts.getTime()}`,
      type: 'danger',
      title: 'ML Model Drift Detected',
      message: `PSI drift score ${(ml.driftScore * 100).toFixed(1)}% exceeds threshold. Model retraining recommended.`,
      timestamp: ts,
      acknowledged: false,
    });
  }
  if (ml.accuracy < 0.82) {
    alerts.push({
      id: `acc-${ts.getTime()}`,
      type: 'warning',
      title: 'Accuracy Degradation',
      message: `Model accuracy dropped to ${(ml.accuracy * 100).toFixed(1)}%. Performance SLA at risk.`,
      timestamp: ts,
      acknowledged: false,
    });
  }
  if (llm.safetyFlag) {
    alerts.push({
      id: `safety-${ts.getTime()}`,
      type: 'danger',
      title: 'LLM Safety Incident',
      message: 'Harmful content pattern detected in LLM response. HITL escalation initiated.',
      timestamp: ts,
      acknowledged: false,
    });
  }
  if (llm.hallucinationRate > 0.15) {
    alerts.push({
      id: `halluc-${ts.getTime()}`,
      type: 'warning',
      title: 'Elevated Hallucination Rate',
      message: `Rate at ${(llm.hallucinationRate * 100).toFixed(1)}% — exceeds 15% compliance threshold.`,
      timestamp: ts,
      acknowledged: false,
    });
  }
  if (llm.latencyMs > 2000) {
    alerts.push({
      id: `latency-${ts.getTime()}`,
      type: 'warning',
      title: 'High LLM Latency',
      message: `Response latency ${llm.latencyMs.toFixed(0)}ms exceeds 2000ms SLA threshold.`,
      timestamp: ts,
      acknowledged: false,
    });
  }
  if (ml.biasScore > 0.14) {
    alerts.push({
      id: `bias-${ts.getTime()}`,
      type: 'info',
      title: 'Bias Score Elevated',
      message: `Fairness metric at ${(ml.biasScore * 100).toFixed(1)}%. Demographic audit triggered.`,
      timestamp: ts,
      acknowledged: false,
    });
  }

  return alerts;
}
