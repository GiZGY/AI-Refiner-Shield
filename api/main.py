from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import DetectionRequest, DetectionResponse, RefineRequest, RefineResponse
from detector import detector_instance
from refiner import Refiner

app = FastAPI(title="AI-Refiner-Shield API", root_path="/api")

# CORS Configuration
origins = [
    "http://localhost:3000",
    "https://ai-refiner-shield.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Refiner with the detector instance
refiner_instance = Refiner(detector_instance)

@app.get("/")
async def root():
    return {"message": "AI-Refiner-Shield Backend is running"}

@app.get("/status")
async def status():
    return {"status": "operational"}

@app.post("/detect", response_model=DetectionResponse)
async def detect_text(request: DetectionRequest):
    return await detector_instance.detect(request.text, request.api_provider)

@app.post("/refine", response_model=RefineResponse)
async def refine_text(request: RefineRequest):
    return await refiner_instance.refine(request.text, request.target_score, request.max_iterations)

from pydantic import BaseModel

class CheckoutRequest(BaseModel):
    user_id: str # In real app, get this from Auth token
    success_url: str = "http://localhost:3000/success"
    cancel_url: str = "http://localhost:3000/cancel"

from stripe_service import create_checkout_session

@app.post("/checkout")
async def create_checkout(request: CheckoutRequest):
    url = await create_checkout_session(request.user_id, request.success_url, request.cancel_url)
    return {"checkout_url": url}
