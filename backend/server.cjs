require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParser.json()); // JSON-Body-Parsing aktivieren
app.use(bodyParser.urlencoded({ extended: true })); // URL-codierte Form-Daten unterstützen

// Routes
app.use("/api/meals", require("./routes/meals.cjs"));
app.use("/api/hochschulportal", require("./routes/hochschulportal.cjs"));
app.use("/api/vpis", require("./routes/vpis.cjs"));
app.use("/api/vpisPlaner", require("./routes/vpisPlaner.cjs"));

app.use("/api/pruefungsplaene/meschede", require("./routes/pruefungsplaene/meschede/ingenieurWirtschaftsRoutes.cjs"));
app.use("/api/pruefungsplaene/hagen", require("./routes/pruefungsplaene/hagen/elektrotechnikInformationstechnikRoutes.cjs"));
app.use("/api/pruefungsplaene/hagen", require("./routes/pruefungsplaene/hagen/technischeBetriebswirtschaftRoutes.cjs"));
app.use("/api/pruefungsplaene/soest", require("./routes/pruefungsplaene/soest/agrarwirtschaftRoutes.cjs"));
app.use("/api/pruefungsplaene/soest", require("./routes/pruefungsplaene/soest/maschinenbauAutomatisierungRoutes.cjs"));
app.use("/api/pruefungsplaene/soest", require("./routes/pruefungsplaene/soest/elektrischeEnergietechnikRoutes.cjs"));
app.use("/api/pruefungsplaene/soest", require("./routes/pruefungsplaene/soest/bildungsGesellschaftsRoutes.cjs"));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Interner Serverfehler." });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}.`);
});