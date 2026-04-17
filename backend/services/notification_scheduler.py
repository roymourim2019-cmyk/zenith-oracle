"""
Daily Push Notification Scheduler for Zenith Oracle.
Runs as a background task inside FastAPI.
Dispatches daily oracle notifications at ~7:00 AM UTC daily.
"""
import asyncio
import logging
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from pywebpush import webpush, WebPushException
from core.config import settings
import json

logger = logging.getLogger(__name__)

DISPATCH_HOUR_UTC = 7
CHECK_INTERVAL_SECONDS = 60 * 30  # check every 30 minutes


async def _dispatch_daily_notifications():
    """Send push to all active subscribers with daily_oracle=True."""
    import swisseph as swe

    client = AsyncIOMotorClient(settings.mongo_url)
    db = client[settings.db_name]

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
        try:
            webpush(
                subscription_info={"endpoint": sub["endpoint"], "keys": sub["keys"]},
                data=json.dumps(payload),
                vapid_private_key=settings.vapid_private_key,
                vapid_claims={"sub": settings.vapid_contact},
            )
            sent += 1
        except WebPushException as e:
            failed += 1
            if e.response and e.response.status_code in (404, 410):
                expired.append(sub.get("endpoint_hash"))
        except Exception:
            failed += 1

    if expired:
        await db.push_subscriptions.update_many(
            {"endpoint_hash": {"$in": expired}},
            {"$set": {"active": False, "expired_at": now.isoformat()}},
        )

    await db.notification_log.insert_one({
        "type": "daily_oracle_cron",
        "payload": payload,
        "sent": sent,
        "failed": failed,
        "expired_cleaned": len(expired),
        "dispatched_at": now.isoformat(),
    })

    logger.info(f"Daily push dispatched: {sent} sent, {failed} failed, {len(expired)} expired")
    client.close()


async def daily_notification_scheduler():
    """Background loop that checks every 30 minutes and dispatches once per day at 7AM UTC."""
    last_dispatch_date = None

    while True:
        try:
            now = datetime.now(timezone.utc)
            today = now.strftime("%Y-%m-%d")

            if now.hour >= DISPATCH_HOUR_UTC and last_dispatch_date != today:
                logger.info(f"Running daily notification dispatch for {today}")
                await _dispatch_daily_notifications()
                last_dispatch_date = today
        except Exception as e:
            logger.error(f"Scheduler error: {e}")

        await asyncio.sleep(CHECK_INTERVAL_SECONDS)
