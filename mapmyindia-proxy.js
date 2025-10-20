// mapmyindia-proxy.js
import express from "express";
import fetch from "node-fetch";
import 'dotenv/config';


const app = express();
const PORT = process.env.PORT || 8081;

// Load your static MapMyIndia key securely from env
const MAPMYINDIA_KEY = process.env.MAPMYINDIA_KEY;

if (!MAPMYINDIA_KEY) {
  console.error("❌ Missing MAPMYINDIA_KEY in environment variables");
  process.exit(1);
}

// Proxy all requests that look like /maptile/<variant>/<z>/<x>/<y>.png
app.get("/maptile/:variant/:z/:x/:y.png", async (req, res) => {
  try {
    const { variant, z, x, y } = req.params;
    const targetUrl = `https://apis.mapmyindia.com/advancedmaps/v1/${MAPMYINDIA_KEY}/maptile/${variant}/${z}/${x}/${y}.png`;

    const response = await fetch(targetUrl, { headers: { "User-Agent": "MapMyIndia-Proxy" } });

    if (!response.ok) {
      res.status(response.status).send("MapMyIndia error");
      return;
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "image/png");
    response.body.pipe(res);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy failure");
  }
});

app.listen(PORT, () => console.log(`🌏 MapMyIndia proxy running on port ${PORT}`));
