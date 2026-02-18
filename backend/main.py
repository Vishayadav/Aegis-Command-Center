from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from ml_monitor import generate_ml_metrics, generate_alerts
from llm_monitor import generate_llm_metrics
from risk_engine import evaluate_governance

app = FastAPI(title="AegisAI Backend")

# allow the frontend (running on a different port during development) to talk to us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/tick")
def tick(
    triggerDrift: bool = Query(False),
    triggerHallucination: bool = Query(False),
    triggerCost: bool = Query(False),
    triggerSafety: bool = Query(False),
):
    """Return a fresh set of ML/LLM metrics and governance information.

    Query parameters mirror the flags exposed in the React sidebar.
    """
    flags = {
        "triggerDrift": triggerDrift,
        "triggerHallucination": triggerHallucination,
        "triggerCost": triggerCost,
        "triggerSafety": triggerSafety,
    }

    ml = generate_ml_metrics(flags)
    llm = generate_llm_metrics(flags)
    alerts = generate_alerts(ml, llm)

    # risk engine operates on a simplified subset of the metrics
    gov_ml = {"drift": ml["driftScore"], "accuracy": ml["accuracy"]}
    gov_llm = {
        "latency": ml["latencyMs"] / 1000.0,  # convert to seconds
        "tokens": llm["tokenUsage"],
        "hallucination": 1 if llm.get("hallucinationRate", 0) > 0.15 or llm.get("safetyFlag") else 0,
    }
    governance = evaluate_governance(gov_ml, gov_llm)

    return {"mlMetrics": ml, "llmMetrics": llm, "alerts": alerts, "governance": governance}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
