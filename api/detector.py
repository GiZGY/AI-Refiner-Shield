import random
import re
from typing import List
from .models import DetectionResponse, Segment

class Detector:
    def __init__(self):
        # Initialize local model if needed
        pass

    async def detect(self, text: str, provider: str = "local") -> DetectionResponse:
        segments = self._split_into_segments(text)
        
        if provider == "local":
            return self._mock_local_detection(text, segments)
        else:
            # TODO: Implement external API calls (Sapling, GPTZero)
            return self._mock_local_detection(text, segments)

    def _split_into_segments(self, text: str) -> List[Segment]:
        # Simple paragraph splitting for now
        # In production, use a robust sentence splitter (e.g., nltk or spacy)
        raw_segments = re.split(r'(\n+)', text)
        segments = []
        current_pos = 0
        
        for raw in raw_segments:
            if not raw.strip():
                current_pos += len(raw)
                continue
                
            segments.append(Segment(
                text=raw,
                score=0.0, # Placeholder
                start=current_pos,
                end=current_pos + len(raw)
            ))
            current_pos += len(raw)
            
        return segments

    def _mock_local_detection(self, text: str, segments: List[Segment]) -> DetectionResponse:
        # Mock logic: Assign random scores for demonstration
        # High score for "AI-like" keywords (just for testing)
        
        overall_score = 0.0
        weighted_sum = 0.0
        total_len = 0
        
        for seg in segments:
            # Random score between 0 and 1
            # Bias towards higher scores for longer technical sentences
            base_score = random.random()
            if len(seg.text.split()) > 20:
                base_score = min(1.0, base_score + 0.2)
            
            seg.score = round(base_score, 2)
            
            weighted_sum += seg.score * len(seg.text)
            total_len += len(seg.text)
            
        if total_len > 0:
            overall_score = round(weighted_sum / total_len, 2)
        
        return DetectionResponse(
            overall_score=overall_score,
            segments=segments,
            provider="local_mock"
        )

detector_instance = Detector()
