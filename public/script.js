document.addEventListener("DOMContentLoaded", () => {

  const API_KEY = "dev-key-123";

  const PLACES = {
    erode: { lat: 11.341, lon: 77.717, tz: 5.5 },
    chennai: { lat: 13.0827, lon: 80.2707, tz: 5.5 },
    coimbatore: { lat: 11.0168, lon: 76.9558, tz: 5.5 },
    bangalore: { lat: 12.9716, lon: 77.5946, tz: 5.5 }
  };

  const btn = document.getElementById("generate");

  btn.addEventListener("click", async () => {

    const dob = document.getElementById("dob").value;
    const tob = document.getElementById("tob").value;
    const placeKey = document.getElementById("place").value;

    if (!dob || !tob || !placeKey) {
      alert("Fill all fields");
      return;
    }

    const place = PLACES[placeKey];

    document.getElementById("lat").textContent = place.lat;
    document.getElementById("lon").textContent = place.lon;
    document.getElementById("tz").textContent = place.tz;

    const time = tob.length === 5 ? tob + ":00" : tob;

    const payload = {
      date: dob,
      time,
      lat: place.lat,
      lon: place.lon,
      timezone: place.tz
    };

    const res = await fetch("/api/chart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      alert("Chart generation failed");
      return;
    }

    const data = await res.json();

    // RESET
    document.querySelectorAll(".box").forEach(b => {
      b.classList.remove("lagna");
      b.querySelectorAll(".planet").forEach(p => p.remove());
    });

    // LAGNA
    const lagnaBox = document.querySelector(
      `.box[data-sign="${data.lagna.rasi}"]`
    );
    if (lagnaBox) lagnaBox.classList.add("lagna");

    // PLANETS
    Object.entries(data.planets).forEach(([name, info]) => {
      const box = document.querySelector(
        `.box[data-sign="${info.rasi}"]`
      );
      if (!box) return;

      const p = document.createElement("div");
      p.className = "planet";
      p.textContent = name;
      box.appendChild(p);
    });
  });

});
