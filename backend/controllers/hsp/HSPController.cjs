const HSPPortalService = require("../../services/HSPPortalService.cjs");
const Portal = require("../../services/Portal.cjs");

// Login für HSP
const loginToHSP = async (req, res) => {
    return Portal.loginService(req, res, HSPPortalService, "hsp", "HSP");
};

// Logout für HSP
const logoutFromHSP = async (req, res) => {
    return Portal.logoutService(req, res, HSPPortalService, "hsp", "HSP");
};

module.exports = { loginToHSP, logoutFromHSP };