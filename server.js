const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "64kb" }));

const PORT = process.env.PORT || 10000;

function validUrl(value) {
  try {
    const u = new URL(value);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

app.get("/", (req, res) => {
  res.json({
    ok: true,
    name: "DropVideo API"
  });
});

app.get("/api/health", (req, res) => {
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
      ضع هنا منطق معالجة الروابط المسموح بها
      للمحتوى الذي تملكه أو لديك إذن باستخدامه.
    */

    return res.json({
      ok: true,
      title: "Video",
      thumbnail: null,
      duration: null,
      uploader: null
    });

  } catch (error) {
    console.error("INFO ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: error?.message || "Could not analyze this URL"
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

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    ok: false,
    error: err?.message || "Internal server error"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("DropVideo API on " + PORT);
});
