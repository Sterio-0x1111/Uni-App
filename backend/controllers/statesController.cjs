const getLoginStates = (req, res) => {
    const stateVSC = req.session.loggedInVSC || false;
    const stateHSP = req.session.loggedInHSP || false;
    const stateVPIS = req.session.loggedInVPIS || false;

    res.json({
        stateVSC,
        stateHSP,
        stateVPIS
    })
}

module.exports = { getLoginStates };