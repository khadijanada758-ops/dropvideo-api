const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "64kb" }));

const PORT = process.env.PORT || 10000;

function validUrl(v) {
  try {
    const u = new URL(v);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

app.get("/", (_, res) => {
  res.json({
    ok: true,
    name: "DropVideo API"
  });
});

app.get("/api/health", (_, res) => {
  res.json({
    ok: true
  });
});

app.post("/api/info", async (req, res) => {
  const url = req.body?.url;

  if (!validUrl(url)) {
    return res.status(400).json({
      ok: false,
      error: "Invalid URL"
    });
  }

  try {
    /*
      هنا خاصك تربط خدمة المعالجة المسموح بها
      ديالك إذا كان الرابط تابع لمحتوى تملكه أو عندك إذن باستعماله.
    */

    return res.json({
      ok: true,
      title: "Video",
      thumbnail: null,
      duration: null,
      uploader: null
    });

  } catch (e) {

    console.error("INFO ERROR:", e);

    return res.status(500).json({
      ok: false,
      error: e?.message || "Could not analyze this URL"
    });
  }
});

app.post("/api/download", async (req, res) => {
  const url = req.body?.url;

  if (!validUrl(url)) {
    return res.status(400).json({
      ok: false,
      error: "Invalid URL"
    });
  }

  return res.status(501).json({
    ok: false,
    error: "Download endpoint is not configured"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("DropVideo API on " + PORT);
});
