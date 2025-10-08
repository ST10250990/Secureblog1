const fs = require('fs');
const https = require('https');
const mongoose = require('mongoose');
require('dotenv').config();
const express = require("express");
const helmet = require("helmet");

const app = express();

// JSON + CSP reports
app.use(express.json({ type: ["application/json", "application/csp-report"] }));

// Helmet headers
app.use(helmet());

// CSP directives
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'"],
  imgSrc: ["'self'"],
  connectSrc: ["'self'"],
  frameAncestors: ["'none'"],
  upgradeInsecureRequests: []
};

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      ...cspDirectives,
      "report-uri": ["/csp-report"],
    },
    reportOnly: process.env.NODE_ENV !== "production",
  })
);

// CSP violation endpoint
app.post("/csp-report", (req, res) => {
  console.log("CSP Violation Report:", JSON.stringify(req.body, null, 2));
  res.sendStatus(204);
});

// Health route
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// SSL options
const sslOptions = {
  key: fs.readFileSync('./src/ssl/privatekey.pem'),
  cert: fs.readFileSync('./src/ssl/certificate.pem'),
};

// MongoDB + HTTPS start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    https.createServer(sslOptions, app).listen(process.env.PORT || 4000, () => {
      console.log(`SecureBlog API running at https://localhost:${process.env.PORT || 4000}`);
      console.log(
        `CSP mode: ${process.env.NODE_ENV !== "production" ? "REPORT-ONLY (dev)" : "ENFORCED (prod)"}`
      );
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB disconnected on app termination");
  process.exit(0);
});