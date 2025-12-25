import swe from "swisseph";
import { getPlanetLongitude, getAscendant } from "./ephemeris.js";

const RASIS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export function longitudeToRasi(longitude) {
  return RASIS[Math.floor(longitude / 30)];
}

export function computeChart(jd, lat, lon) {
  const planets = {
    Sun: getPlanetLongitude(jd, swe.SE_SUN),
    Moon: getPlanetLongitude(jd, swe.SE_MOON),
    Mars: getPlanetLongitude(jd, swe.SE_MARS),
    Mercury: getPlanetLongitude(jd, swe.SE_MERCURY),
    Jupiter: getPlanetLongitude(jd, swe.SE_JUPITER),
    Venus: getPlanetLongitude(jd, swe.SE_VENUS),
    Saturn: getPlanetLongitude(jd, swe.SE_SATURN),
    Rahu: getPlanetLongitude(jd, swe.SE_TRUE_NODE)
  };

  planets.Ketu = (planets.Rahu + 180) % 360;

  const ascendantLongitude = getAscendant(jd, lat, lon);
  const lagnaRasi = longitudeToRasi(ascendantLongitude);

  return {
    ascendantLongitude,
    lagnaRasi,
    planets
  };
}
