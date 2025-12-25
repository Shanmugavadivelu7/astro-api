    import swe from "swisseph";
import { DateTime } from "luxon";

export function toJulian(date, time, timezone) {
  const dt = DateTime.fromISO(
    `${date}T${time}`,
    { zone: timezone }
  ).toUTC();

  return swe.swe_julday(
    dt.year,
    dt.month,
    dt.day,
    dt.hour + dt.minute / 60 + dt.second / 3600,
    swe.SE_GREG_CAL
  );
}
