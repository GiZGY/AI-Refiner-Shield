from pydantic import BaseModel
from typing import List, Optional

class Segment(BaseModel):
    text: str
    score: float  # 0.0 to 1.0 (1.0 = AI)
    start: int
    end: int

class DetectionRequest(BaseModel):
    text: str
    api_provider: Optional[str] = "local" # "sapling", "gptzero", "local"

class DetectionResponse(BaseModel):
    overall_score: float
    segments: List[Segment]
    provider: str

class RefineRequest(BaseModel):
    text: str
    target_score: float = 0.2
    max_iterations: int = 3

class RefineResponse(BaseModel):
    original_text: str
    refined_text: str
    final_score: float
    iterations_used: int
    history: List[dict] # Intermediate steps
