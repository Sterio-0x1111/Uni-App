const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = 3000;
app.use(cors());

// Mensa Plan laden 
app.get('/api/meals/:mensa', async (req, res) => {
    try{
        console.log('Request');
        console.log(req.params.mensa);
        const loc = req.params.mensa.toLowerCase(); // Holt den Mensanamen aus der URL
        console.log(loc);
        const url = `https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/${loc}`;
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const mealsTable = $('.meals tbody').html();

        if(mealsTable){
            res.json( { table: mealsTable } );
            console.log('Successfully send response!');
        } else {
            res.status(500).json( { err: 'Fehler! Daten wurden nicht gesendet!' } );
            console.log('Daten nicht gesendet!');
        }
    } catch(err){
        console.log('Fehler beim Laden der Daten.', err);
    }
})

// weitere end points

app.listen(PORT, () => {
    console.log('Server läuft auf Port 3000.');
})