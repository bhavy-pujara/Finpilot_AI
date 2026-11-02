import re
from typing import Tuple, List

PROHIBITED_PHRASES = [
    r"guaranteed\s+(return|profit|gain)",
    r"risk-free\s+(trade|investment|profit)",
    r"100%\s+(sure|win|success)",
    r"surefire\s+(profit|gain|way)",
    r"can\'t\s+lose",
    r"double\s+your\s+money\s+in",
]

DISCLAIMER_TEXT = "\n\n*Educational Disclaimer: FinPilot AI provides market analytics and research intelligence for educational evaluation. Not SEBI/SEC registered investment advice.*"

def validate_and_sanitize_response(content: str) -> Tuple[bool, str, List[str]]:
    """
    Validates LLM output against safety guardrails.
    Returns (is_compliant, sanitized_content, warnings).
    """
    warnings = []
    is_compliant = True

    for pattern in PROHIBITED_PHRASES:
        if re.search(pattern, content, re.IGNORECASE):
            warnings.append(f"Detected prohibited financial guarantee pattern: {pattern}")
            is_compliant = False
            # Sanitize phrase
            content = re.sub(pattern, "[unverified financial claim redacted]", content, flags=re.IGNORECASE)

    # Ensure educational disclaimer
    if "*Educational Disclaimer" not in content and "FinPilot AI provides market analytics" not in content:
        content = content.strip() + DISCLAIMER_TEXT

    return is_compliant, content, warnings
