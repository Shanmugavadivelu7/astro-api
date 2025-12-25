import swe from "swisseph";

swe.swe_set_ephe_path("./ephe");
swe.swe_set_sid_mode(swe.SE_SIDM_LAHIRI);

const FLAGS = swe.SEFLG_SIDEREAL | swe.SEFLG_SWIEPH;

export function getPlanetLongitude(jd, planet) {
  const res = swe.swe_calc_ut(jd, planet, FLAGS);
  if (res.error) throw new Error(res.error);
  return res.data[0];
}

export function getAscendant(jd, lat, lon) {
  const res = swe.swe_houses_ex(
    jd,
    swe.SEFLG_SIDEREAL,
    lat,
    lon,
    "W" // Whole sign
  );
  return res.ascendant;
}
