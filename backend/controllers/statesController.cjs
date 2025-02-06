const getLoginStates = (req, res) => {
    const stateVSC = req.session.loggedInVSC || false;
    const stateHSP = req.session.loggedInHSP || false;
    const stateVPIS = req.session.loggedInVPIS || false;

    console.log('States: ', req.session.loggedInVSC);

    res.status(200).json({
        stateVSC,
        stateHSP,
        stateVPIS
    })
}

module.exports = { getLoginStates };