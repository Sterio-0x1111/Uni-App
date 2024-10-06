require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");


const mealsRoutes = require("./routes/meals.cjs");
const hochschulportalRoutes = require("./routes/hochschulportal.cjs");
const vpisRoutes = require("./routes/vpis.cjs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json()); // JSON-Body-Parsing aktivieren
app.use(bodyParser.urlencoded({ extended: true })); // URL-codierte Form-Daten unterstützen

// Routes
app.use("/api/meals", mealsRoutes);
app.use("/api/hochschulportal", hochschulportalRoutes);
app.use("/api/vpis", vpisRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Interner Serverfehler.' });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}.`);
});