import swisseph as swe
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# ---- Swiss Ephemeris setup ----
swe.set_sid_mode(swe.SIDM_LAHIRI)

class ChartRequest(BaseModel):
    date: str       # YYYY-MM-DD
    time: str       # HH:MM:SS
    lat: float
    lon: float
    timezone: float # +5.5 for IST

def to_julian(date, time, tz):
    y, m, d = map(int, date.split("-"))
    hh, mm, ss = map(int, time.split(":"))
    ut = hh + mm / 60 + ss / 3600 - tz
    return swe.julday(y, m, d, ut)

@app.post("/chart")
def chart(req: ChartRequest):
    jd = to_julian(req.date, req.time, req.timezone)

    # ---- Planets (SIDEREAL) ----
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL

    planets = {
        "Sun": swe.calc_ut(jd, swe.SUN, flags)[0][0],
        "Moon": swe.calc_ut(jd, swe.MOON, flags)[0][0],
        "Mars": swe.calc_ut(jd, swe.MARS, flags)[0][0],
        "Mercury": swe.calc_ut(jd, swe.MERCURY, flags)[0][0],
        "Jupiter": swe.calc_ut(jd, swe.JUPITER, flags)[0][0],
        "Venus": swe.calc_ut(jd, swe.VENUS, flags)[0][0],
        "Saturn": swe.calc_ut(jd, swe.SATURN, flags)[0][0],
        "Rahu": swe.calc_ut(jd, swe.TRUE_NODE, flags)[0][0],
    }

    planets["Ketu"] = (planets["Rahu"] + 180) % 360

    # ---- Tropical houses (stable) ----
    houses, ascmc = swe.houses(
        jd,
        req.lat,
        req.lon,
        b'P'   # Placidus (house system irrelevant for Lagna sign)
    )

    tropical_asc = ascmc[0]

    # ---- Convert to SIDEREAL Lagna manually ----
    ayanamsa = swe.get_ayanamsa(jd)
    sidereal_asc = (tropical_asc - ayanamsa) % 360

    return {
        "ascendantLongitude": sidereal_asc,
        "planets": planets
    }
