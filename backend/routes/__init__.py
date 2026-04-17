from .vedic import router as vedic_router
from .western import router as western_router
from .chinese import router as chinese_router
from .numerology import router as numerology_router
from .tarot import router as tarot_router
from .oracle import router as oracle_router
from .synthesis import router as synthesis_router
from .ai import router as ai_router
from .system import router as system_router
from .notifications import router as notifications_router
from .pdf_report import router as pdf_router

all_routers = [
    vedic_router,
    western_router,
    chinese_router,
    numerology_router,
    tarot_router,
    oracle_router,
    synthesis_router,
    ai_router,
    system_router,
    notifications_router,
    pdf_router,
]
