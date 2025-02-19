require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const https = require("https");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const { CookieJar } = require("tough-cookie");
//const RedisStore = require("connect-redis").default;
//const { createClient } = require("redis");
const helmet = require("helmet");
const csurf = require("csurf");
const rateLimit = require("express-rate-limit");

// Redis-Client erstellen
/*const redisClient = createClient({ url: "redis://localhost:6379" });
redisClient.connect().catch(console.err);*/

const session = require("express-session");

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const PORT = process.env.PORT;
const app = express();
const cryptoKey = crypto.randomBytes(32).toString("hex");

// HTTPS Konfiguration für Zertifikat
const options = {
  key: fs.readFileSync("certs/privkey.pem"),
  cert: fs.readFileSync("certs/cert.crt"),
};

// Middlewars
app.use(
  cors({
    origin: ['http://localhost:8100', 'http://localhost:5173'], // Frontend-URL
    credentials: true, // Cookies und andere Anmeldeinformationen zulassen
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json()); // JSON-Body-Parsing aktivieren
app.use(bodyParser.urlencoded({ extended: true })); // URL-codierte Form-Daten unterstützen

app.use(
  session({
    secret: cryptoKey, // Ein geheimer Schlüssel, um die Session zu signieren
    resave: false, // Verhindert das Speichern von Session-Daten, wenn nichts geändert wurde
    saveUninitialized: false, // Verhindert das Erstellen von Sessions, die nicht initialisiert sind
    cookie: {
      secure: false,
      sameSite: 'strict',
      httpOnly: true,
      maxAge: 1000 * 60 * 20, // 20 min
    },
    //store: new RedisStore({ client: redisClient }),
    store: new session.MemoryStore(),
  })
);

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(helmet());
//app.use(csurf());

/**
 * Middleware zum Session Handling.
 *
 * Diese Middleware erstellt ein CookieJar pro Benutzer
 * und einen benutzerspezifischen Axios Client,
 * sodass der Benutzer anfrageübergreifend eingeloggt bleibt.
 
app.use((req, res, next) => {
  
  if (!req.session.hspCookies) {
    req.session.hspCookies = new CookieJar();
  }

  if (!req.session.vpisCookies) {
    req.session.vpisCookies = new CookieJar();
  }

  next();
});


const checkSessionDestroy = (req, res, next) => {
  if (req.session && req.session.states) {
    const { stateVSC, stateHSP, stateVPIS } = req.session.states;

    if (!stateVSC && !stateHSP && !stateVPIS) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session konnte nicht gelöscht werden:", err);
        }
      });
    }
  }
  next();
};

app.use(checkSessionDestroy);
*/

// Routes
app.use('/api/departments', require('./routes/departments.cjs'));
app.use('/api/auth', require('./routes/centralAuthentication.cjs'));
app.use("/api/hochschulportal", require("./routes/hochschulportal.cjs"));
app.use("/api/vpisPlaner", require("./routes/vpisPlaner.cjs"));
app.use("/api/meals", require("./routes/meals.cjs"));
app.use("/api/mensa/options", require("./routes/meals.cjs"));
app.use("/api/semester", require("./routes/semester.cjs"));
app.use("/api/hsp", require("./routes/HSP.cjs"));
app.use("/api/vsc", require("./routes/VSC.cjs"));
app.use("/api/vpis", require("./routes/VPIS.cjs"));
app.use("/api", require("./routes/states.cjs"));

app.get("/api/vsc/pruefungen");

// Routenpfade und zugehörige Route-Module definieren
const routes = {
  meschede: ["ingenieurWirtschaftsRoutes.cjs"],
  hagen: [
    "elektrotechnikInformationstechnikRoutes.cjs",
    "technischeBetriebswirtschaftRoutes.cjs",
  ],
  soest: [
    "agrarwirtschaftRoutes.cjs",
    "maschinenbauAutomatisierungRoutes.cjs",
    "elektrischeEnergietechnikRoutes.cjs",
    "bildungsGesellschaftsRoutes.cjs",
  ],
  iserlohn: [
    "informatikNaturwissenschaftRoutes.cjs",
    "maschinenbauRoutes.cjs",
    "vpisIserlohnPruefungsRoutes.cjs",
  ],
};

// Schleife, um alle Routen zu registrieren
for (const [location, routeFiles] of Object.entries(routes)) {
  routeFiles.forEach((route) => {
    app.use(
      `/api/pruefungsplaene/${location}`,
      require(`./routes/pruefungsplaene/${location}/${route}`)
    );
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Interner Serverfehler." });
});

// HTTPS Server, falls vertrauenswürdiges Zertifikat vorhanden
/*https.createServer(options, app).listen(PORT, () => {
  console.log(`HTTPS Server läuft auf Port ${PORT}.`);
});*/

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}.`);
});