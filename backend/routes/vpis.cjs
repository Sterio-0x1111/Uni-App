// routes/vpis.cjs
const express = require("express");
const { loginToVPIS, logoutFromVPIS, getSemesters } = require("../controllers/vpis/VPISController.cjs");
const { scrapeMyNews, scrapeMyMessage } = require("../controllers/vpis/newsController.cjs");
const router = express.Router();

router.post("/login", loginToVPIS);
router.get("/logout", logoutFromVPIS);
router.get("/semesters", getSemesters);
router.get("/news", scrapeMyNews);
router.get("/news/message/:msgID", scrapeMyMessage);

module.exports = router;