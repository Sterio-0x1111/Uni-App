const HSPPortalService = require("../services/HSPPortalService.cjs");
const VPISPortalService = require("../services/VPISPortalService.cjs");

const getLoginStates = (req, res) => {
  const stateVSC = req.session.loggedInVSC || false;
  const stateHSP = HSPPortalService.verify(req);
  const stateVPIS = VPISPortalService.verify(req);

  res.status(200).json({
    stateVSC,
    stateHSP,
    stateVPIS,
  });
};

module.exports = { getLoginStates };