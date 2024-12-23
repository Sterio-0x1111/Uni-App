require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { CookieJar } = require("tough-cookie");

const session = require("express-session");

const PORT = process.env.PORT;
const app = express();

// Middlewars
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend-URL
    credentials: true, // Cookies und andere Anmeldeinformationen zulassen
  })
);
app.use(bodyParser.json()); // JSON-Body-Parsing aktivieren
app.use(bodyParser.urlencoded({ extended: true })); // URL-codierte Form-Daten unterstützen

app.use(
  session({
    secret: "geheimesSchlüsselwort", // Ein geheimer Schlüssel, um die Session zu signieren
    resave: false, // Verhindert das Speichern von Session-Daten, wenn nichts geändert wurde
    saveUninitialized: false, // Verhindert das Erstellen von Sessions, die nicht initialisiert sind
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
    store: new session.MemoryStore(),
  })
);

/**
 * Middleware zum Session Handling.
 *
 * Diese Middleware erstellt ein CookieJar pro Benutzer
 * und einen benutzerspezifischen Axios Client,
 * sodass der Benutzer anfrageübergreifend eingeloggt bleibt.
 */
app.use((req, res, next) => {
  /*if (!req.session.vscCookies) {
    req.session.vscCookies = new CookieJar();
  }*/

  if (!req.session.hspCookies) {
    req.session.hspCookies = new CookieJar();
  }

  if (!req.session.vpisCookies) {
    req.session.vpisCookies = new CookieJar();
  }

  next();
});

// Routes
app.use("/api/hochschulportal", require("./routes/hochschulportal.cjs"));
app.use("/api/vpis", require("./routes/vpis.cjs"));
app.use("/api/vpisPlaner", require("./routes/vpisPlaner.cjs"));
app.use("/api/meals", require("./routes/meals.cjs"));
app.use("/api/mensa/options", require("./routes/meals.cjs"));
app.use("/api/semester", require("./routes/semester.cjs"));
app.use("/api/hsp", require("./routes/HSP.cjs"));
app.use("/api/vsc", require("./routes/VSC.cjs"));
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

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}.`);
});
