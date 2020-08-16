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
const pg = require('pg'); // sql first step in intializing
const superagent = require('superagent');
const { response, query } = require('express');
const client = new pg.Client(process.env.DATABASE_URL);
const methodOverride = require('method-override');
app.use(methodOverride('_method'));


const Player = require("./Models/Player").default;
const LastMatch = require("./Models/LastMatch").default;
const LeagueMatch = require("./Models/LeagueMatch").default;
const Match = require("./Models/Match").default;



app.get('/aaaaa', (req, res) => { // home page
    getLastMatches();
    //res.render('index', {booksResult: bookArr});
});

app.get('/', (request, response) => {
    //slider
    let matchesArr = [];
    let link = `https://www.scorebat.com/video-api/v1/`;
    superagent.get(link)
        .then((returnedData) => {
            //  let matchesArr = [];
            for (let i = 0; i < 5; i++) {
                matchesArr.push(new LastMatch(returnedData.body[i]));
            }
            //  response.render('index', { latestMatches: matchesArr });
        });
    //end of slider
    //start of leagues latest matches results
    let allLeaguesObj = {};
    //let allLeaguesNames= [];  //////////
    let leaguesLink = 'https://www.thesportsdb.com/api/v1/json/1/all_leagues.php';
    superagent.get(leaguesLink).then((returnedLeagueData) => {

            for (let i = 0; i < 4; i++) { //give 4 leagues
                let leagueName = returnedLeagueData.body.leagues[i].strLeague;
                //allLeaguesNames.push(leagueName);   //////////
                let leagueId = returnedLeagueData.body.leagues[i].idLeague;
                let latestLeagueMatchesLink = `https://www.thesportsdb.com/api/v1/json/1/eventspastleague.php?id=${leagueId}`;

                superagent.get(latestLeagueMatchesLink).then((returnedLatestLeagueMatchesData) => {
                    let oneLeagueMatchesArr = [];
                    for (let j = 0; j < 4; j++) {
                        oneLeagueMatchesArr.push(new LeagueMatch(returnedLatestLeagueMatchesData.body.events[j]));
                    }
                    allLeaguesObj[`${leagueName}`] = oneLeagueMatchesArr;
                    if (i == 3) {
                        response.render('index', { latestMatches: matchesArr, leagues: allLeaguesObj });
                    }
                });
            }
            //console.log(allLeaguesNames); //////////
            //console.log(allLeaguesObj);
            //response.send(allLeaguesObj);
            // response.render('index', { latestMatches: leaguesArr });
        })
        // .then((allLeaguesObj) => {
        //     console.log(allLeaguesObj);
        //     response.send(allLeaguesObj);
        // });
});

app.get('/searchplayer', (request, response) => {
    let playerName = request.query.playerName;
    let link = `https://www.thesportsdb.com/api/v1/json/1/searchplayers.php?p=${playerName}`;
    superagent.get(link).then((returnedData) => {
        var x;
        let playersArray = [];
        if (returnedData.body.player.length < 10) {
            x = returnedData.body.player.length;
        } else {
            x = 10;
        }
        for (var i = 0; i < x; i++) {
            let item = returnedData.body.player[i];

            if (item.strSport == 'Soccer') {
                let player = new Player(item);
                playersArray.push(player);
            }
        }
        response.render('players', { players: playersArray });
    });
});

app.get('/player', (request, response) => {
    response.render('players')
});


app.get('/matches', (request, response) => {
    let link = `https://www.thesportsdb.com/api/v1/json/1/all_countries.php`;
    superagent.get(link).then((returnedData) => {
        console.log('returnedData.body: ', returnedData.body)

        response.render('search-matches', { countries: returnedData.body.countries });
    });


});


app.get('/matches/searchByCountry', (request, response) => {
    let countryName = request.query.countryName;
    // console.log('countryName', countryName);
    let link = `https://www.thesportsdb.com/api/v1/json/1/search_all_leagues.php?c=${countryName}`;

    superagent.get(link).then((returnedData) => {
        console.log('returnedData.body: ', returnedData.body.countrys)

        response.render('search-matches', { leagues: returnedData.body.countrys });
    });
});

//get matches using team name
app.get('/matches/searchMatchesByTeamName', (request, response) => {
    let teamName = request.query.teamName;
    // console.log('teamName: ', teamName);

    let teamNamelink = `https://www.thesportsdb.com/api/v1/json/1/searchteams.php?t=${teamName}`;
    superagent.get(teamNamelink).then((returnedData) => {
        // console.log('Teams result: ', returnedData.body.teams);
        returnedData.body.teams.forEach(element => {
            // console.log('element: ', element.idTeam);
            let matchesLink = `https://www.thesportsdb.com/api/v1/json/1/eventsnext.php?id=${element.idTeam}`;
            superagent.get(matchesLink).then((matchesData) => {
                // console.log('matchesData: ', matchesData.body.events);
                if (matchesData.body && matchesData.body.events && matchesData.body.events.length) {
                    matchesData.body.events.forEach(event => {
                        let match = new Match(event);
                        // console.log(match);
                    });
                }
            });

        });
    });
    console.log('matchesReult: ', Match.all);
    response.render('search-matches', { matches: Match.all });
});



//get
app.get('/matches/searchEventsByPlayerName', (request, response) => {
    let teamIdLink = `https://www.thesportsdb.com/api/v1/json/1/searchteams.php?t=${request.query.teamName}`;
    superagent.get(teamIdLink).then((returnedData) => {
        console.log('returnedData.body: ', returnedData.body.countrys);
        response.render('search-matches', { leagues: returnedData.body.countrys });
    });
});

app.get('/matches/searchEventsByLeaguee', (request, response) => {
    let teamIdLink = `https://www.thesportsdb.com/api/v1/json/1/searchteams.php?t=${request.query.teamName}`;
    superagent.get(teamIdLink).then((returnedData) => {
        console.log('returnedData.body: ', returnedData.body.countrys);
        response.render('search-matches', { leagues: returnedData.body.countrys });
    });
});

app.get('/about-us', (request, response) => {
    response.render('about-us')
});

app.listen(PORT, () => { // to Start the express server only after the database connection is established.
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