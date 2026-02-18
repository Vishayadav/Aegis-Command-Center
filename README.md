# 🏦 AegisAI — Unified AI Observability & Governance Platform

## 🚨 Problem

Modern banks use multiple AI systems:

- Traditional ML models → credit scoring, fraud detection
- LLM systems → chatbots, document processing, assistants

But these systems are monitored separately.
There is **no single place to understand AI risk**.

This creates:

- Model drift going unnoticed
- Hallucinated responses
- Compliance violations
- Financial & reputational damage

---

## 💡 Our Solution

**AegisAI** provides a unified governance layer that continuously monitors ML + LLM systems and produces a real-time **AI Health Score**.

The platform detects risk before damage happens.

---

## 🧠 Key Features

### 1. ML Observability

- Detects model drift
- Tracks prediction accuracy
- Flags unreliable models

### 2. LLM Monitoring

- Measures latency
- Tracks token usage
- Detects unsafe responses

### 3. Governance Engine

- Combines ML + LLM risks
- Generates AI Health Score
- Classifies risk level

### 4. Unified Dashboard

- Single view of AI behavior
- Live risk alerts
- Explainable metrics

---

## 🏗️ Architecture Flow

AI Systems → Monitoring Layer → Risk Engine → Governance Score → Dashboard

---

## ⚙️ Tech Stack

**Backend**

- FastAPI
- Python
- NumPy / Scikit-learn
- Uvicorn

**Frontend**

- Streamlit
- Plotly
- Pandas

**Deployment**

- Render (Backend)
- Streamlit Cloud (Frontend)

---

## ▶️ How To Run Locally

### Backend API

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API Documentation: `http://127.0.0.1:8000/docs`

Available Endpoints:

- `GET /` — Health check
- `GET /api/ml-metrics` — ML monitoring metrics
- `GET /api/llm-metrics` — LLM monitoring metrics
- `GET /api/governance` — Combined governance score
- `GET /api/governance/detailed` — Detailed risk breakdown
- `GET /api/dashboard` — Complete system snapshot
- `POST /api/test/scenario/*` — Test scenarios (normal, drift, attack, critical)

### Frontend Dashboard

```bash
cd frontend
pip install -r requirements.txt
streamlit run dashboard.py
```

Dashboard URL: `http://localhost:8501`

---

## 📊 Dashboard Features

### Pages

**1. Executive Control Room (Overview)**

- Global Risk Indicator (LOW/MEDIUM/HIGH)
- 4 KPI Cards (Accuracy, Drift, Latency, Cost)
- Real-time accuracy trend chart
- Token usage distribution
- Active alerts feed

**2. ML Observability**

- Model drift gauge
- Accuracy, precision, recall trends
- Bias score indicator
- Latency monitoring
- Recent predictions table

**3. LLM Observability**

- Hallucination rate gauge
- Safety compliance score
- Token usage & cost tracking
- Daily cost accumulation
- LLM interaction logs

**4. Governance & Responsible AI**

- Active alerts & incidents
- Compliance dashboard
- Risk heatmap by component
- Human-in-the-loop metrics
- Compliance controls documentation

### Simulation Controls (Sidebar)

Toggle to test scenarios:

- **ML Drift** — Simulates model degradation
- **LLM Hallucination** — Simulates unsafe responses
- **High Token Cost** — Simulates cost spike
- **Safety Incident** — Triggers compliance alerts

---

## 🎯 Key Scenarios

### Normal Operation

All systems healthy, metrics within normal ranges.

### ML Drift Detected

- Accuracy drops below 80%
- Drift score exceeds 50%
- Status: "High Risk"
- Action: Review retraining

### LLM Hallucination Spike

- Hallucination rate > 20%
- Safety flag triggered
- Status: "Unsafe"
- Action: Immediate escalation

### Critical (Combined)

Both ML drift AND LLM attack occur simultaneously.
Risk level: **CRITICAL - GOVERNANCE ACTION REQUIRED**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│      ML + LLM Systems (Banking)         │
└────────────────────┬────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
    ┌───▼────┐           ┌───────▼───┐
    │ ML     │           │ LLM       │
    │Monitor │           │ Monitor   │
    └───┬────┘           └────┬──────┘
        │                     │
        └────────────┬────────┘
                     │
            ┌────────▼─────────┐
            │  Risk Engine     │
            │ (Governance)     │
            └────────┬─────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
    ┌───▼────┐           ┌───────▼────┐
    │ FastAPI│           │ Streamlit  │
    │ Backend│           │ Dashboard  │
    └────────┘           └────────────┘
```

---

## 🔐 Responsible AI Features

✅ **Real-time Bias Monitoring** — Detects fairness issues across demographics

✅ **Hallucination Detection** — Automatically flags unsafe LLM responses

✅ **Safety Compliance** — Enforces governance rules and policies

✅ **Audit Logging** — Complete trace of all AI decisions

✅ **Human-in-the-Loop** — Critical decisions require human approval

✅ **Explainability** — Model decisions are transparent and traceable

---

## 📈 Performance Metrics

The dashboard tracks:

**ML Metrics:**

- Accuracy, Precision, Recall
- Model Drift (PSI)
- Bias Score
- Latency

**LLM Metrics:**

- Response Latency
- Token Usage & Cost
- Hallucination Rate
- Safety Compliance Score
- Throughput (requests/min)

**Governance:**

- AI Health Score (0-100)
- Risk Level (STABLE → MONITORING → ELEVATED → CRITICAL)
- Active Alerts
- Compliance Status

---

## 🚀 Deployment

### Backend

```bash
# Using Render
git push render main
```

### Frontend

```bash
# Using Streamlit Cloud
Connect GitHub repo → Deploy
```

---

## 📝 Project Structure

```
AegisAI/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── llm_monitor.py          # LLM metrics generation
│   ├── ml_monitor.py           # ML metrics generation
│   ├── risk_engine.py          # Governance & risk scoring
│   └── requirements.txt         # Backend dependencies
├── frontend/
│   ├── dashboard.py            # Streamlit app
│   └── requirements.txt         # Frontend dependencies
└── README.md                   # This file
```

---

## 🎯 Demo Scenario

1. **Baseline**: System starts in healthy state (All metrics green)
2. **Trigger Drift**: Check "ML Drift" toggle in sidebar
3. **Monitor**: Watch accuracy drop, drift score rise
4. **Alert**: Red alerts appear in feed, risk indicator turns HIGH
5. **Escalate**: Governance page shows escalation needed
6. **Resolve**: Uncheck toggle, watch recovery

This demonstrates end-to-end AI governance in action.

---

## 👥 Team

Built with intention — AegisAI Team

Enterprise-grade AI Governance Platform for Banking.
