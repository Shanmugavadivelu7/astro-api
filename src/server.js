import Fastify from "fastify";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "@fastify/rate-limit";
import { API_KEYS } from "./config/apiKeys.js";
import { formatLongitude } from "./utils/astroFormat.js";

const fastify = Fastify({ logger: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- Rate Limit (global fallback) ----
fastify.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute"
});

// ---- Serve UI ----
fastify.register(import("@fastify/static"), {
  root: path.join(__dirname, "../public"),
  prefix: "/",
});

// ---- API KEY GUARD ----
fastify.addHook("preHandler", async (req, reply) => {
  if (req.url.startsWith("/api/")) {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey || !API_KEYS[apiKey]) {
      return reply.code(401).send({ error: "Invalid or missing API key" });
    }

    req.apiUser = API_KEYS[apiKey];
  }
});

// ---- Helper ----
const RASIS = [
  "Aries","Taurus","Gemini","Cancer",
  "Leo","Virgo","Libra","Scorpio",
  "Sagittarius","Capricorn","Aquarius","Pisces"
];

// ---- Chart API ----
fastify.post("/api/chart", {
  config: {
    rateLimit: {
      max: 30, // default fallback
      timeWindow: "1 minute"
    }
  }
}, async (req, reply) => {

  const { date, time, lat, lon, timezone } = req.body;
  const user = req.apiUser;

  if (!date || !time || lat == null || lon == null || timezone == null) {
    return reply.code(400).send({ error: "Invalid input" });
  }

  // ---- Per-key rate override ----
  reply.raw.setHeader(
    "X-RateLimit-Limit",
    user.limit
  );

  // ---- Call Python ----
  const pyRes = await fetch("http://127.0.0.1:5001/chart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, time, lat, lon, timezone })
  });

  if (!pyRes.ok) {
    return reply.code(500).send({ error: "Ephemeris failure" });
  }

  const pyData = await pyRes.json();

  const planets = {};
  for (const [p, lonVal] of Object.entries(pyData.planets)) {
    planets[p] = formatLongitude(lonVal);
  }

  const lagna = formatLongitude(pyData.ascendantLongitude);

  reply.send({
    plan: user.plan,
    lagna,
    planets
  });
});

// ---- Start ----
fastify.listen({ port: 3000 }, () => {
  console.log("Node API running at http://localhost:3000");
});
