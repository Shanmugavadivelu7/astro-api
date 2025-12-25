const RASIS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export function formatLongitude(longitude) {
  const rasiIndex = Math.floor(longitude / 30);
  const rasi = RASIS[rasiIndex];

  const degreesInSign = longitude % 30;
  const degrees = Math.floor(degreesInSign);
  const minutes = Math.floor((degreesInSign - degrees) * 60);

  return {
    rasi,
    degrees,
    minutes,
    formatted: `${rasi} ${degrees}°${minutes}′`
  };
}
    