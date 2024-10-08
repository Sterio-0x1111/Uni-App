const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");

const { createAxiosClient } = require('./utils/helpers.cjs')

const session = require('express-session');

const PORT = 3000; // auslagern in env
const app = express();

// Middlewars
app.use(cors());
app.use(bodyParser.json()); // JSON-Body-Parsing aktivieren
app.use(bodyParser.urlencoded({ extended: true })); // URL-codierte Form-Daten unterstützen

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
    req.clientVSC = createAxiosClient(req, 'VSC'); // Virtuelles Service Center
    req.clientHSP = createAxiosClient(req, 'HSP'); // Hochschulportal
    req.clientVPIS = createAxiosClient(req, 'VPIS') // Vorlesungsplan Informationssystem

    next();
})

app.use("/api/meals", require("./routes/meals.cjs"));
app.use("/api/mensa/options", require("./routes/meals.cjs"));
app.use('/api/semester', require('./routes/semester.cjs'));
app.use('/api/hsp', require('./routes/HSP.cjs'));
app.use('/api/vsc', require('./routes/VSC.cjs'));

// weitere end points

app.listen(PORT, () => {
    console.log('Server läuft auf http://localhost:3000.');
})