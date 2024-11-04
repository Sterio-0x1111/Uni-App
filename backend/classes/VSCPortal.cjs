const Portal = require('./Portal.cjs');

class VSCPortal extends Portal {
    constructor(){
        super();
    }

    async login(loginPayload){
        const loginPageURL = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=1&category=auth.login&startpage=portal.vm&breadCrumbSource=portal';
        const client = this.createAxiosClient();

        try {
            const response = await client.post(loginPageURL, loginPayload.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            });

            const data = response.data;
            const state = data.includes('Meine Prüfungen');
            this._loginState = state;
            return state;

        } catch (error) {
            console.log('Failed to login to VSC.', error);
            //res.status(500).send('Fehler beim Login.');
            return false;
        }
    }
}

module.exports = { VSCPortal };