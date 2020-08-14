'use strict'
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
require('dotenv').config();
const PORT = process.env.PORT || 3000;
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
const pg = require('pg');  // sql first step in intializing
const superagent = require('superagent');
const { response, query } = require('express');
const client = new pg.Client(process.env.DATABASE_URL);
const methodOverride = require('method-override');
app.use(methodOverride('_method'));


const Player = require("./Models/Player").default;
const LastMatch = require("./Models/LastMatch").default;



app.get('/aaaaa', (req, res) => {  // home page
    getLastMatches();
    //res.render('index', {booksResult: bookArr});
});

app.get('/', (request, response) => {

    let link = `https://www.scorebat.com/video-api/v1/`;
    superagent.get(link)
        .then((returnedData) => {
            let matchesArr = [];
            for (let i = 0; i < 5; i++) {
                matchesArr.push(new LastMatch(returnedData.body[i]));
            }
            response.render('index', { latestMatches: matchesArr });
        });
});

app.get('/searchplayer', (request, response) => {
    console.log('request: ', request.query.playerName);
    let playerName = request.query.playerName;
    let link = `https://www.thesportsdb.com/api/v1/json/1/searchplayers.php?p=${playerName}`;
    superagent.get(link).then((returnedData) => {
        // console.log('returnedData: ',returnedData);
        let playerObject = new Player(returnedData.body.player[0]);
        console.log('playerObject: ',playerObject);

        response.render('players', { player: playerObject });
    });
});

app.get('/player', (request, response) => {


    response.render('players')
});

app.get('/about-us', (request, response) => {


    response.render('about-us')
});


app.listen(PORT, () => {          // to Start the express server only after the database connection is established.
    console.log('server is listening to the port: ', PORT);
});
function getLastMatches() {
    console.log('inside func');
    let url = `https://www.scorebat.com/video-api/v1/`;
    return superagent.get(url).then(data => {
        let matchData = data.body.map(lastMatch);
        return matchesData;
    });
}





// client.connect().then(() => {           // this is a promise and we need to start the server after it connects to the database
//     // app.listen
//     app.listen(PORT, () => {          // to Start the express server only after the database connection is established.
//         console.log('server is listening to the port: ', PORT);
//     });
// });

