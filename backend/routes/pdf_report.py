from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.vedic_service import VedicAstrologyService
from services.western_service import WesternAstrologyService
from services.chinese_service import ChineseAstrologyService
from services.numerology_service import NumerologyService
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from io import BytesIO
from datetime import datetime, timezone

router = APIRouter(tags=["PDF Reports"])

vedic = VedicAstrologyService()
western = WesternAstrologyService()
chinese = ChineseAstrologyService()
numerology = NumerologyService()


class PDFRequest(BaseModel):
    name: str
    birth_date: str
    birth_time: str
    latitude: float
    longitude: float
    timezone_offset: float = 5.5


@router.post("/chart-pdf")
async def generate_birth_chart_pdf(req: PDFRequest):
    try:
        vedic_chart = vedic.calculate_birth_chart(
            req.birth_date, req.birth_time,
            req.latitude, req.longitude, req.timezone_offset
        )
        western_chart = western.calculate_birth_chart(
            req.birth_date, req.birth_time,
            req.latitude, req.longitude, req.timezone_offset
        )
        chinese_data = chinese.calculate_chinese_sign(req.birth_date)
        numerology_data = numerology.calculate_numerology(req.name, req.birth_date)

        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        bg = HexColor("#020617")
        gold = HexColor("#D4AF37")
        white = HexColor("#FFFFFF")
        gray = HexColor("#94A3B8")

        c.setFillColor(bg)
        c.rect(0, 0, width, height, fill=1)

        c.setFillColor(gold)
        c.rect(0, height - 2*mm, width, 2*mm, fill=1)
        c.rect(0, 0, width, 2*mm, fill=1)

        y = height - 40*mm
        c.setFont("Helvetica-Bold", 28)
        c.setFillColor(gold)
        c.drawCentredString(width/2, y, "ZENITH ORACLE")
        y -= 10*mm
        c.setFont("Helvetica", 11)
        c.setFillColor(gray)
        c.drawCentredString(width/2, y, "Scripture-Bound Deterministic Math | Swiss Ephemeris Precision")
        y -= 6*mm
        c.setFont("Helvetica", 8)
        c.drawCentredString(width/2, y, f"Generated {datetime.now(timezone.utc).strftime('%B %d, %Y at %H:%M UTC')}")

        y -= 12*mm
        c.setStrokeColor(HexColor("#D4AF3740"))
        c.setLineWidth(0.5)
        c.line(30*mm, y, width - 30*mm, y)

        y -= 12*mm
        c.setFont("Helvetica-Bold", 16)
        c.setFillColor(white)
        c.drawCentredString(width/2, y, f"Cosmic Blueprint for {req.name}")
        y -= 8*mm
        c.setFont("Helvetica", 10)
        c.setFillColor(gray)
        c.drawCentredString(width/2, y, f"Born: {req.birth_date} at {req.birth_time} | Lat: {req.latitude:.4f}, Lon: {req.longitude:.4f}")

        def section_header(c, y, title):
            y -= 14*mm
            c.setFillColor(gold)
            c.setFont("Helvetica-Bold", 13)
            c.drawString(20*mm, y, title)
            y -= 3*mm
            c.setStrokeColor(HexColor("#D4AF3760"))
            c.setLineWidth(0.4)
            c.line(20*mm, y, width - 20*mm, y)
            return y

        def data_row(c, y, label, value, indent=20):
            y -= 6*mm
            c.setFont("Helvetica", 9)
            c.setFillColor(gray)
            c.drawString(indent*mm, y, label)
            c.setFillColor(white)
            c.drawString(70*mm, y, str(value))
            return y

        y = section_header(c, y, "VEDIC ASTROLOGY (Sidereal)")
        y = data_row(c, y, "Ascendant (Lagna)", f"{vedic_chart['ascendant_sign']} at {vedic_chart['ascendant']:.2f}")
        y = data_row(c, y, "Ayanamsha (Lahiri)", f"{vedic_chart['ayanamsha']:.6f}")
        y = data_row(c, y, "Nakshatra (Lunar Mansion)", vedic_chart['lunar_mansion'])
        y = data_row(c, y, "Dasha Lord", f"{vedic_chart['dasha_lord']} ({vedic_chart['dasha_balance_years']:.1f} years remaining)")
        y = data_row(c, y, "Power Score", f"{vedic_chart['power_score']}/100")

        y -= 4*mm
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(gold)
        c.drawString(20*mm, y, "Planetary Positions:")
        for planet in vedic_chart['planets']:
            deg = planet.get('degree_in_sign', planet.get('degree', 0))
            nak = planet.get('nakshatra', '—')
            pada = planet.get('pada', '—')
            y = data_row(c, y, f"  {planet['name']}", f"{planet['sign']} {deg:.2f} | Nak: {nak} P{pada}", indent=24)

        y = section_header(c, y, "WESTERN ASTROLOGY (Tropical)")
        y = data_row(c, y, "Ascendant", western_chart.get('ascendant_sign', '—'))
        y = data_row(c, y, "Chart Type", western_chart.get('chart_type', 'Western Tropical'))
        for planet in western_chart.get('planets', [])[:7]:
            deg = planet.get('degree_in_sign', planet.get('degree', 0))
            y = data_row(c, y, f"  {planet['name']}", f"{planet['sign']} {deg:.2f}", indent=24)

        if y < 80*mm:
            c.showPage()
            c.setFillColor(bg)
            c.rect(0, 0, width, height, fill=1)
            y = height - 20*mm

        y = section_header(c, y, "CHINESE ASTROLOGY (Lunisolar)")
        y = data_row(c, y, "Animal Sign", chinese_data.get('animal_sign', '—'))
        y = data_row(c, y, "Element", chinese_data.get('element', '—'))
        y = data_row(c, y, "Yin/Yang", chinese_data.get('yin_yang', '—'))
        y = data_row(c, y, "Compatible Signs", ', '.join(chinese_data.get('compatible_signs', [])[:4]))

        y = section_header(c, y, "NUMEROLOGY (Triple-System)")
        y = data_row(c, y, "Chaldean Number", str(numerology_data.get('chaldean_number', '—')))
        y = data_row(c, y, "Pythagorean Number", str(numerology_data.get('pythagorean_number', '—')))
        y = data_row(c, y, "Vedic Number", str(numerology_data.get('vedic_number', '—')))

        c.setFillColor(gold)
        c.rect(0, 14*mm, width, 0.4*mm, fill=1)
        c.setFont("Helvetica", 7)
        c.setFillColor(gray)
        c.drawCentredString(width/2, 9*mm, "Calculations powered by Swiss Ephemeris (NASA JPL DE431) | Roy's Enterprise")
        c.setFillColor(HexColor("#6B7280"))
        c.drawCentredString(width/2, 5*mm, "2026 Roy's Enterprise. All Rights Reserved.")

        c.save()
        buffer.seek(0)

        filename = f"zenith_oracle_{req.name.replace(' ', '_')}_{req.birth_date}.pdf"
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
