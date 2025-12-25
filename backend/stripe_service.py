import stripe
import os
from fastapi import HTTPException

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

# Hardcoded for now, or fetch from DB
PRICE_ID = "price_1Si7DABRQf6twr2KetcquMg5" 

async def create_checkout_session(user_id: str, success_url: str, cancel_url: str):
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe API key not configured")

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': PRICE_ID,
                'quantity': 1,
            }],
            mode='payment', # or 'subscription'
            success_url=success_url,
            cancel_url=cancel_url,
            client_reference_id=user_id,
            metadata={
                "user_id": user_id
            }
        )
        return session.url
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
