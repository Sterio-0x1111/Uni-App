const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");

const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const axios = require('axios');

const { createAxiosClient } = require('./utils/helpers.cjs')

const session = require('express-session');

const PORT = 3000; // auslagern in env
const app = express();

// Middlewars

app.use(bodyParser.json()); // JSON-Body-Parsing aktivieren
app.use(bodyParser.urlencoded({ extended: true })); // URL-codierte Form-Daten unterstützen
app.use(cors({
  origin: 'http://localhost:8100',  // Frontend-URL
  credentials: true                 // Cookies und andere Anmeldeinformationen zulassen
}));

app.use(session({
  secret: 'geheimesSchlüsselwort',   // Ein geheimer Schlüssel, um die Session zu signieren
  resave: false,                     // Verhindert das Speichern von Session-Daten, wenn nichts geändert wurde
  saveUninitialized: false,          // Verhindert das Erstellen von Sessions, die nicht initialisiert sind
  cookie: { secure: false }          // Setze `secure: true`, wenn du HTTPS verwendest
}));

/**
 * Middleware zum Session Handling.
 * 
 * Diese Middleware erstellt ein CookieJar pro Benutzer 
 * und einen benutzerspezifischen Axios Client, 
 * sodass der Benutzer anfrageübergreifend eingeloggt bleibt.
*/
app.use((req, res, next) => {
  if (!req.session.vscCookies) {
    req.session.vscCookies = new CookieJar();
  }

  if(!req.session.hspCookies){
    req.session.hspCookies = new CookieJar();
  }

  if(!req.session.vpisCookies){
    req.session.vpisCookies = new CookieJar();
  }

  next();
})

app.use('/api/vsc', require('./routes/VSC.cjs'));

// weitere end points

app.listen(PORT, () => {
  console.log('Server läuft auf http://localhost:3000.');
})