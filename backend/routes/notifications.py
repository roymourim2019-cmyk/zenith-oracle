from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
from pywebpush import webpush, WebPushException
import json
import hashlib
import logging

router = APIRouter(tags=["Notifications"])
logger = logging.getLogger(__name__)

mongo_client = AsyncIOMotorClient(settings.mongo_url)
db = mongo_client[settings.db_name]


class PushSubscription(BaseModel):
    endpoint: str
    keys: dict
    user_name: Optional[str] = None


class NotificationPreferences(BaseModel):
    daily_oracle: bool = True
    transit_alerts: bool = False
    streak_reminders: bool = True


class NotificationPayload(BaseModel):
    title: str = "Zenith Oracle"
    body: str = "Your daily cosmic update is ready."
    url: str = "/daily"


def _send_push(subscription_info: dict, payload: dict) -> bool:
    try:
        webpush(
            subscription_info=subscription_info,
            data=json.dumps(payload),
            vapid_private_key=settings.vapid_private_key,
            vapid_claims={"sub": settings.vapid_contact},
        )
        return True
    except WebPushException as e:
        logger.warning(f"Push failed: {e}")
        if e.response and e.response.status_code in (404, 410):
            return False  # subscription expired
        return False
    except Exception as e:
        logger.error(f"Push error: {e}")
        return False


@router.get("/notifications/vapid-key")
async def get_vapid_key():
    return {"public_key": settings.vapid_public_key}


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
        last_dispatch = await db.notification_log.find_one(
            sort=[("dispatched_at", -1)],
        )
        last_time = last_dispatch["dispatched_at"] if last_dispatch else None
        return {"active_subscribers": total, "last_dispatch": last_time}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stats failed: {str(e)}")


@router.post("/notifications/dispatch-daily")
async def dispatch_daily_oracle_notification():
    """Send daily oracle digest to all active subscribers with daily_oracle preference enabled."""
    import swisseph as swe

    try:
        now = datetime.now(timezone.utc)
        jd_now = swe.julday(now.year, now.month, now.day, now.hour + now.minute / 60.0)
        moon_pos = swe.calc_ut(jd_now, swe.MOON)[0]
        signs = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"]
        moon_sign = signs[int(moon_pos[0] / 30) % 12]

        element_map = {"Aries":"Fire","Leo":"Fire","Sagittarius":"Fire","Taurus":"Earth","Virgo":"Earth","Capricorn":"Earth","Gemini":"Air","Libra":"Air","Aquarius":"Air","Cancer":"Water","Scorpio":"Water","Pisces":"Water"}
        element = element_map.get(moon_sign, "Fire")
        mood_map = {"Fire": "Ambitious", "Earth": "Grounded", "Air": "Inspired", "Water": "Intuitive"}
        mood = mood_map.get(element, "Powerful")

        payload = {
            "title": f"{mood} Energy — Moon in {moon_sign}",
            "body": f"Your daily cosmic digest is ready. {element} element dominates today.",
            "url": "/daily",
        }

        cursor = db.push_subscriptions.find(
            {"active": True, "preferences.daily_oracle": True},
            {"_id": 0, "endpoint": 1, "keys": 1, "endpoint_hash": 1},
        )

        sent = 0
        failed = 0
        expired = []

        async for sub in cursor:
            sub_info = {"endpoint": sub["endpoint"], "keys": sub["keys"]}
            success = _send_push(sub_info, payload)
            if success:
                sent += 1
            else:
                failed += 1
                expired.append(sub.get("endpoint_hash"))

        if expired:
            await db.push_subscriptions.update_many(
                {"endpoint_hash": {"$in": expired}},
                {"$set": {"active": False, "expired_at": now.isoformat()}},
            )

        await db.notification_log.insert_one({
            "type": "daily_oracle",
            "payload": payload,
            "sent": sent,
            "failed": failed,
            "expired_cleaned": len(expired),
            "dispatched_at": now.isoformat(),
        })

        return {
            "status": "dispatched",
            "sent": sent,
            "failed": failed,
            "expired_cleaned": len(expired),
            "payload": payload,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dispatch failed: {str(e)}")


@router.post("/notifications/send-test")
async def send_test_notification(sub: PushSubscription):
    """Send a test notification to a single subscriber to verify push works."""
    payload = {
        "title": "Zenith Oracle — Test",
        "body": "Push notifications are working. The cosmos is connected.",
        "url": "/daily",
    }
    sub_info = {"endpoint": sub.endpoint, "keys": sub.keys}
    success = _send_push(sub_info, payload)
    if success:
        return {"status": "sent", "payload": payload}
    raise HTTPException(status_code=500, detail="Push delivery failed")
