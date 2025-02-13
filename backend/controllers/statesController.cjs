const HSPPortalService = require("../services/HSPPortalService.cjs");
const VPISPortalService = require("../services/VPISPortalService.cjs");

const getLoginStates = (req, res) => {
    const stateVSC = req.session.loggedInVSC || false;
    const stateHSP = HSPPortalService.verifySession(req, res) !== null;
    const stateVPIS = VPISPortalService.verifySession(req, res) !== null;

    res.status(200).json({
        stateVSC,
        stateHSP,
        stateVPIS
    })
}

module.exports = { getLoginStates };