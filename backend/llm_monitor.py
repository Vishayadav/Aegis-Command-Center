import time
import random
from datetime import datetime
from typing import Dict, Any


def clamp(val: float, minv: float, maxv: float) -> float:
    return max(minv, min(maxv, val))


def randn(mean: float, std: float) -> float:
    # normal distribution sample
    return random.gauss(mean, std)


def generate_llm_metrics(flags: Dict[str, bool]) -> Dict[str, Any]:
    """Produce synthetic LLM metrics matching frontend schema."""
    attack = flags.get("triggerHallucination", False) or flags.get("triggerSafety", False)
    highCost = flags.get("triggerCost", False)

    latencyMs = clamp(randn(2200 if attack else 680, 400 if attack else 120), 200, 5000)
    tokenUsage = clamp(
        round(randn(1800 if highCost else 420, 300 if highCost else 120)),
        50,
        4096,
    )
    costUsd = (tokenUsage / 1000) * (0.06 if highCost else 0.025)
    hallucinationRate = clamp(
        (0.22 + random.random() * 0.25) if attack else (0.02 + random.random() * 0.05),
        0,
        1,
    )
    safetyFlag = flags.get("triggerSafety", False) or (attack and random.random() < hallucinationRate)
    throughputRpm = clamp(randn(28 if attack else 92, 12), 5, 200)
    contextLength = round(clamp(randn(2400, 800), 512, 8192))

    return {
        "latencyMs": latencyMs,
        "tokenUsage": tokenUsage,
        "costUsd": costUsd,
        "hallucinationRate": hallucinationRate,
        "safetyFlag": safetyFlag,
        "throughputRpm": throughputRpm,
        "contextLength": contextLength,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


def get_llm_metrics(trigger_attack: bool = False) -> Dict[str, Any]:
    # legacy compatibility
    return generate_llm_metrics({
        "triggerHallucination": trigger_attack,
    })


# -----------------------------
# Fake LLM response generator
# -----------------------------

SAFE_RESPONSES = [
    "Your account balance is ₹12,540.",
    "Your loan application is under review.",
    "Transaction completed successfully.",
    "Your KYC is verified."
]

UNSAFE_RESPONSES = [
    "Your password is 123456",
    "Send OTP here to verify",
    "I can bypass bank security",
    "Share your PIN for faster service"
]


# -----------------------------
# Simulate chatbot call
# -----------------------------

def call_fake_llm(trigger_attack=False):

    start = time.time()

    # simulate model thinking delay
    time.sleep(random.uniform(0.3, 2.5))

    latency = time.time() - start

    if trigger_attack:
        response = random.choice(UNSAFE_RESPONSES)
        hallucination = 1
    else:
        response = random.choice(SAFE_RESPONSES)
        hallucination = 0

    tokens = random.randint(50, 500)

    return latency, tokens, hallucination, response


# -----------------------------
# FINAL FUNCTION FOR SYSTEM
# -----------------------------

def get_llm_metrics(trigger_attack: bool = False):

    try:
        latency, tokens, hallucination, response = call_fake_llm(trigger_attack)

        return {
            "latency": round(float(latency), 3),
            "tokens": int(tokens),
            "hallucination": int(hallucination)
        }

    except Exception:
        return {
            "latency": 0.0,
            "tokens": 0,
            "hallucination": 1
        }


# -----------------------------
# TEST RUN
# -----------------------------
if __name__ == "__main__":
    print("Normal:", get_llm_metrics(False))
    print("Attack :", get_llm_metrics(True))
