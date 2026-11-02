import numpy as np
import pandas as pd
from typing import Dict, Any, List

def calculate_portfolio_hhi(weights: List[float]) -> float:
    """
    Calculate Herfindahl-Hirschman Index (HHI) for concentration.
    weights: list of percentages or fractions summing to 100 or 1.
    Returns HHI between 0 and 10,000.
    """
    if not weights:
        return 0.0
    arr = np.array(weights, dtype=float)
    if arr.sum() <= 1.01:
        arr = arr * 100.0  # convert fraction to percentage
    hhi = float(np.sum(arr ** 2))
    return round(hhi, 2)

def get_hhi_category(hhi: float) -> str:
    """Classify concentration according to standard antitrust/economic brackets."""
    if hhi < 1500:
        return "Diversified (Low Concentration)"
    elif hhi <= 2500:
        return "Moderately Concentrated"
    else:
        return "Highly Concentrated (Elevated Risk)"

def calculate_correlation_matrix(asset_returns_df: pd.DataFrame) -> Dict[str, Any]:
    """Calculate pairwise correlation matrix for assets."""
    if asset_returns_df.empty or len(asset_returns_df.columns) < 2:
        return {"symbols": list(asset_returns_df.columns), "matrix": []}
    
    corr_df = asset_returns_df.corr().fillna(0.0)
    matrix = [[round(float(val), 2) for val in row] for row in corr_df.values]
    return {
        "symbols": list(corr_df.columns),
        "matrix": matrix
    }
