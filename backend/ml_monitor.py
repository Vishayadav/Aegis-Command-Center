import random
from datetime import datetime
from typing import Dict, Any


def clamp(val: float, minv: float, maxv: float) -> float:
    return max(minv, min(maxv, val))


def randn(mean: float, std: float) -> float:
    return random.gauss(mean, std)


def generate_ml_metrics(flags: Dict[str, bool]) -> Dict[str, Any]:
    """Produce synthetic ML metrics for the frontend demo."""
    drift = flags.get("triggerDrift", False)

    accuracy = clamp(randn(0.77 if drift else 0.926, 0.04 if drift else 0.008), 0.6, 0.999)
    precision = clamp(randn(0.74 if drift else 0.908, 0.05 if drift else 0.01), 0.6, 0.999)
    recall = clamp(randn(0.73 if drift else 0.893, 0.05 if drift else 0.01), 0.6, 0.999)
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) != 0 else 0

    driftScore = clamp((0.45 + random.random() * 0.4) if drift else (0.08 + random.random() * 0.12), 0, 1)
    biasScore = clamp(0.04 + random.random() * 0.12, 0, 1)

    latencyMs = clamp(randn(210 if drift else 82, 40 if drift else 15), 30, 500)
    throughput = clamp(randn(320 if drift else 780, 60), 100, 1200)

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "driftScore": driftScore,
        "biasScore": biasScore,
        "latencyMs": latencyMs,
        "throughput": throughput,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


def get_ml_metrics(trigger_drift: bool = False):
    # legacy stub remains for backwards compatibility, delegates to generator
    return generate_ml_metrics({"triggerDrift": trigger_drift})


def generate_alerts(ml: Dict[str, Any], llm: Dict[str, Any]) -> list:
    """Returns alert items using same structure as frontend"""
    alerts = []
    ts = datetime.utcnow().isoformat() + "Z"

    if ml.get("driftScore", 0) > 0.4:
        alerts.append({
            "id": f"drift-{int(datetime.utcnow().timestamp()*1000)}",
            "type": "danger",
            "title": "ML Model Drift Detected",
            "message": f"PSI drift score {(ml['driftScore']*100):.1f}% exceeds threshold. Model retraining recommended.",
            "timestamp": ts,
            "acknowledged": False,
        })
    if ml.get("accuracy", 1) < 0.82:
        alerts.append({
            "id": f"acc-{int(datetime.utcnow().timestamp()*1000)}",
            "type": "warning",
            "title": "Accuracy Degradation",
            "message": f"Model accuracy dropped to {(ml['accuracy']*100):.1f}%. Performance SLA at risk.",
            "timestamp": ts,
            "acknowledged": False,
        })
    if llm.get("safetyFlag"):
        alerts.append({
            "id": f"safety-{int(datetime.utcnow().timestamp()*1000)}",
            "type": "danger",
            "title": "LLM Safety Incident",
            "message": "Harmful content pattern detected in LLM response. HITL escalation initiated.",
            "timestamp": ts,
            "acknowledged": False,
        })
    if llm.get("hallucinationRate", 0) > 0.15:
        alerts.append({
            "id": f"halluc-{int(datetime.utcnow().timestamp()*1000)}",
            "type": "warning",
            "title": "Elevated Hallucination Rate",
            "message": f"Rate at {(llm['hallucinationRate']*100):.1f}% — exceeds 15% compliance threshold.",
            "timestamp": ts,
            "acknowledged": False,
        })
    if llm.get("latencyMs", 0) > 2000:
        alerts.append({
            "id": f"latency-{int(datetime.utcnow().timestamp()*1000)}",
            "type": "warning",
            "title": "High LLM Latency",
            "message": f"Response latency {llm['latencyMs']:.0f}ms exceeds 2000ms SLA threshold.",
            "timestamp": ts,
            "acknowledged": False,
        })
    if ml.get("biasScore", 0) > 0.14:
        alerts.append({
            "id": f"bias-{int(datetime.utcnow().timestamp()*1000)}",
            "type": "info",
            "title": "Bias Score Elevated",
            "message": f"Fairness metric at {(ml['biasScore']*100):.1f}%. Demographic audit triggered.",
            "timestamp": ts,
            "acknowledged": False,
        })

    return alerts

# existing code continues

    try:
        live_data = get_live_data(trigger_drift)

        drift = calculate_drift(live_data)

        preds = model.predict(live_data)
        actual = (live_data[:, 0] + live_data[:, 1] > 100).astype(int)
        accuracy = np.mean(preds == actual)

        status = "stable"
        if drift > 0.25:
            status = "drift_detected"

        return {
            "drift": round(float(drift), 3),
            "accuracy": round(float(accuracy), 3),
            "status": status
        }

    except Exception as e:
        # prevents API crash during demo
        return {
            "drift": 0.0,
            "accuracy": 0.0,
            "status": "error"
        }
# -----------------------------
# TEST RUN
# -----------------------------
if __name__ == "__main__":
    print("Normal:", get_ml_metrics(False))
    print("Drift :", get_ml_metrics(True))
