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
const LastMatch = require("./Models/LastMatch.js").default;
const LeagueMatch = require("./Models/LeagueMatch").default;
const Match = require("./Models/Match").default;



app.get('/aaaaa', (req, res) => { // home page
    getLastMatches();
    //res.render('index', {booksResult: bookArr});
});

//Home Page Route
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

//search for player Route
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
    //get all fav player link
    let favPlayerLink = `https://www.thesportsdb.com/api/v1/json/1/searchloves.php?u=zag`;
    // extract Ids of fav players
    let favPlayersIds = [];
    //result array which will be passed to ejs file
    let playersArray = [];
    try {
        superagent.get(favPlayerLink).then(data => {
            favPlayersIds = data.body.players.map(player => {
                    // if there is no id 'No Id Provided' will be the value of id then we will filter it
                    return player.idPlayer || 'No Id Provided';
                }).filter(item => {
                    return item != 'No Id Provided';
                })
                // console.log('favPlayersIds: ', favPlayersIds);
            let randomFavPlayerIndex = Math.floor(Math.random() * favPlayersIds.length + 1);
            // console.log('randomFavPlayerIndex: ', randomFavPlayerIndex);
            let getPlayerByIdLink = `https://www.thesportsdb.com/api/v1/json/1/lookupplayer.php?id=${favPlayersIds[randomFavPlayerIndex]}`;
            superagent.get(getPlayerByIdLink).then(item => {
                if (item.body.players[0].strSport == 'Soccer') {
                    let player = new Player(item.body.players[0]);
                    // console.log('player: ', player);
                    playersArray.push(player);
                }
                response.render('players', { players: playersArray });
            })
        })
    } catch (error) {
        console.log('error: ', error);
    }
});

// matches page
app.get('/matches', (request, response) => {

    let all_leaguesLink = `https://www.thesportsdb.com/api/v1/json/1/all_leagues.php`;
    superagent.get(all_leaguesLink).then(leagues => {
        console.log('leagues.body: ', leagues.body.leagues);
        // console.log('returnedData.body: ', returnedData.body.countries);
        response.render('search-matches', { leagues: leagues.body.leagues });
    })
});


function getAllLeaguesLink(request, response) {
    let all_leaguesLink = `https://www.thesportsdb.com/api/v1/json/1/all_leagues.php`;
    superagent.get(all_leaguesLink).then(leagues => {
        console.log('leagues.body: ', leagues.body.leagues);
        // console.log('returnedData.body: ', returnedData.body.countries);
    })


}

//get matches using team name
app.get('/searchMatchesByTeamName', (request, response) => {
    let teamName = request.query.teamName;
    console.log('reques.query', request.query)
    let matchesArray = [];
    let idsArray = [];
    console.log('teamName: ', teamName);
    let teamNamelink = `https://www.thesportsdb.com/api/v1/json/1/searchteams.php?t=${teamName}`;
    superagent.get(teamNamelink).then((returnedData) => {
        // console.log('Teams result: ', returnedData.body.teams);
        returnedData.body.teams.forEach(element => {
            // console.log('element: ', element.idTeam);
            idsArray.push(element.idTeam);
        });
        console.log(idsArray);
        for (var i = 0; i < idsArray.length; i++) {
            let j = i;
            let matchesLink = `https://www.thesportsdb.com/api/v1/json/1/eventsnext.php?id=${idsArray[i]}`;
            superagent.get(matchesLink).then((matchesData) => {
                // console.log('matchesData: ', matchesData.body.events);
                if (matchesData.body && matchesData.body.events && matchesData.body.events.length) {
                    matchesData.body.events.map((event) => {
                        let match = new Match(event);
                        matchesArray.push(match);
                    });
                }
                if (j == idsArray.length - 1) {
                    console.log('matchesArray: ', matchesArray);
                    response.render('search-matches', { matches: matchesArray });
                }
            });
        };
    });
});

//get matches using league
app.get('/searchMatchesByLeagueName', (request, response) => {
    // console.log('request.query: ', request.query);
    let leagueId = request.query.leagueInputList;
    let matchesArray = [];
    // console.log('leagueId: ', leagueId);
    let leagueIdlink = `https://www.thesportsdb.com/api/v1/json/1/eventsnextleague.php?id=${leagueId}`;
    superagent.get(leagueIdlink).then((returnedData) => {
        if (returnedData.body && returnedData.body.events && returnedData.body.events.length) {
            returnedData.body.events.forEach(event => {
                let match = new Match(event);
                matchesArray.push(match);
            });
        }
        console.log('matchesArray: ', matchesArray);
        response.render('search-matches', { matches: matchesArray });
    });
});

//about us page route
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