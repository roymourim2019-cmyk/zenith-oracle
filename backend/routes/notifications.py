from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
import json
import hashlib

router = APIRouter(tags=["Notifications"])

mongo_client = AsyncIOMotorClient(settings.mongo_url)
db = mongo_client[settings.db_name]

VAPID_PUBLIC_KEY = "BDummyVAPIDPublicKeyForPWABuilderComplianceTestingOnly000000000000000000000000000000000000000="
VAPID_PRIVATE_KEY = "dummyPrivateKeyForDevOnly"


class PushSubscription(BaseModel):
    endpoint: str
    keys: dict
    user_name: Optional[str] = None


class NotificationPreferences(BaseModel):
    daily_oracle: bool = True
    transit_alerts: bool = False
    streak_reminders: bool = True


@router.get("/notifications/vapid-key")
async def get_vapid_key():
    return {"public_key": VAPID_PUBLIC_KEY}


@router.post("/notifications/subscribe")
async def subscribe_push(sub: PushSubscription):
    try:
        sub_hash = hashlib.sha256(sub.endpoint.encode()).hexdigest()[:16]
        await db.push_subscriptions.update_one(
            {"endpoint_hash": sub_hash},
            {"$set": {
                "endpoint": sub.endpoint,
                "keys": sub.keys,
                "endpoint_hash": sub_hash,
                "user_name": sub.user_name,
                "preferences": {"daily_oracle": True, "transit_alerts": False, "streak_reminders": True},
                "subscribed_at": datetime.now(timezone.utc).isoformat(),
                "active": True,
            }},
            upsert=True,
        )
        return {"status": "subscribed", "endpoint_hash": sub_hash}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Subscription failed: {str(e)}")


@router.post("/notifications/unsubscribe")
async def unsubscribe_push(sub: PushSubscription):
    try:
        sub_hash = hashlib.sha256(sub.endpoint.encode()).hexdigest()[:16]
        await db.push_subscriptions.update_one(
            {"endpoint_hash": sub_hash},
            {"$set": {"active": False, "unsubscribed_at": datetime.now(timezone.utc).isoformat()}},
        )
        return {"status": "unsubscribed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unsubscribe failed: {str(e)}")


@router.put("/notifications/preferences")
async def update_preferences(endpoint_hash: str, prefs: NotificationPreferences):
    try:
        result = await db.push_subscriptions.update_one(
            {"endpoint_hash": endpoint_hash, "active": True},
            {"$set": {"preferences": prefs.model_dump()}},
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Subscription not found")
        return {"status": "updated", "preferences": prefs.model_dump()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preferences update failed: {str(e)}")


@router.get("/notifications/stats")
async def get_notification_stats():
    try:
        total = await db.push_subscriptions.count_documents({"active": True})
        return {"active_subscribers": total}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stats failed: {str(e)}")
