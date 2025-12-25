const RASIS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];
const DEV_API_KEY = "dev-key-123";

function longitudeToRasi(longitude) {
  return RASIS[Math.floor(longitude / 30)];
}

async function loadChart() {
  console.log("Loading chart…");

  const payload = {
    date: "1997-05-03",
    time: "20:07:00",
    lat: 11.341,
    lon: 77.717,
    timezone: 5.5
  };

  const res = await fetch("/api/chart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "dev-key-123"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    console.error("Chart API failed", res.status);
    return;
  }

  const data = await res.json();
  console.log("API DATA:", data);

  // ---- RESET UI ----
  document.querySelectorAll(".box").forEach(box => {
    box.classList.remove("lagna");
    box.querySelectorAll(".planet").forEach(p => p.remove());
  });

  // ---- APPLY LAGNA ----
  const lagnaSign = data.lagna.rasi;
  console.log("Lagna sign:", lagnaSign);

  const lagnaBox = document.querySelector(
    `.box[data-sign="${lagnaSign}"]`
  );

  if (!lagnaBox) {
    console.error("Lagna box NOT FOUND for:", lagnaSign);
  } else {
    lagnaBox.classList.add("lagna");
  }

  // ---- PLACE PLANETS ----
  Object.entries(data.planets).forEach(([planet, info]) => {
    const rasi = info.rasi;
    const box = document.querySelector(`.box[data-sign="${rasi}"]`);

    if (!box) {
      console.warn("No box for planet", planet, rasi);
      return;
    }

    const div = document.createElement("div");
    div.className = "planet";
    div.textContent = planet;

    if (planet === "Rahu") div.classList.add("rahu");
    if (planet === "Ketu") div.classList.add("ketu");

    box.appendChild(div);
  });
}

// ---- ENSURE DOM IS READY ----
document.addEventListener("DOMContentLoaded", loadChart);
