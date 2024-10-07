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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Interner Serverfehler." });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}.`);
});