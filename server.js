'use strict'
const express = require('express');
var session = require('express-session');
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
app.use(session({
    secret: 'save',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true,
    maxAge: 60000 }
  }))

const Player = require("./Models/Player").default;
const LastMatch = require("./Models/LastMatch.js").default;
const LeagueMatch = require("./Models/LeagueMatch").default;
const Match = require("./Models/Match").default;

app.get('/aaaaa', (req, res) => { // home page
    getLastMatches();
});

app.get('/', (request, response) => {
    console.log(request.session);
    //slider
    let matchesArr = [];
    let link = `https://www.scorebat.com/video-api/v1/`;
    superagent.get(link)
        .then((returnedData) => {
            for (let i = 0; i < 5; i++) {
                matchesArr.push(new LastMatch(returnedData.body[i]));
            }
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
    let matchesArray = [];
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
                        matchesArray.push(match);
                        // console.log(match);
                    });
                }
                console.log('matches: ', matchesArray);
                response.render('search-matches', { matches: matchesArray });
            }).catch(e => {
                console.log(e);
            });
        });

    });
});



//get matches league
app.get('/matches/searchMatchesByLeagueName', (request, response) => {
    let leagueId = request.query.leagueId;
    let matchesArray = [];

    // console.log('leagueId: ', leagueId);

    let leagueIdlink = `https://www.thesportsdb.com/api/v1/json/1/eventsnextleague.php?id=${leagueId}`;
    superagent.get(leagueIdlink).then((returnedData) => {
        // console.log('returnedData: ', returnedData.body.events);

        // console.log('Teams result: ', returnedData.body.teams);     
        // console.log('element: ', element.idTeam);
        // console.log('matchesData: ', matchesData.body.events);
        if (returnedData.body && returnedData.body.events && returnedData.body.events.length) {
            returnedData.body.events.forEach(event => {

                let match = new Match(event);
                matchesArray.push(match);


                // console.log(match);
            });
        }

        console.log('matchesReult: ', matchesArray);
        response.render('search-matches', { matches: matchesArray });


    });
});

app.post('/signup', signUser);
app.post('/login', logUser);
app.get('/logout', logout);

app.get('/:id', (req,res) => {
    res.redirect(`/`);
})

function signUser(req,res){
  let {username,email,psw} = req.body;
  let SQL = 'INSERT into account(username,email,psw) VALUES ($1, $2, $3);';
  let values = [username,email,psw];
  return client.query(SQL, values).then( ()=>{
    let SQL2 = 'SELECT * FROM account WHERE email = $1;';
    let values2 = [req.body.email];
    return client.query(SQL2,values2).then( data => {
    res.redirect(`/${data.rows[0].id}`);
      })
    }).catch(err => console.log(err));
}

function logUser(req,res){
  let {username,psw} = req.body;
  let SQL = 'SELECT * FROM account WHERE username = $1 AND psw = $2;';
  let values = [username,psw];
  return client.query(SQL, values).then( data =>{
      console.log(data.rows[0]);
      if(!data.rows[0]){
          res.redirect(`/`);
      } else {
          req.session.username = username;
          req.session.psw = psw;
        res.redirect(`/:id`);
      }
    }).catch(err => console.log(err));
}

function logout (req, res, next) {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          console.log(err);
        } else {
          return res.redirect('/');
        }
      });
    }
}

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


function LeagueMatch(match) {
    this.matchName = match.strEvent;
    this.leagueName = match.strLeague;
    this.homeTeam = match.strHomeTeam;
    this.homeTeamId = match.idHomeTeam;
    this.awayTeamId = match.idAwayTeam;
    this.homeTeamScore = match.intHomeScore || 0;
    this.awayTeam = match.strAwayTeam;
    this.awayTeamScore = match.intAwayScore || 0;
    this.eventImg = match.strThumb || 'not found';
    this.matchGoalsVideo = match.strVideo || 'not found';
    return this;
}


client.connect().then(() => { 
          // this is a promise and we need to start the server after it connects to the database
    app.listen(PORT, () => {          // to Start the express server only after the database connection is established.
        console.log('server is listening to the port: ', PORT);
    });
});
// client.connect().then(() => {           // this is a promise and we need to start the server after it connects to the database
//     // app.listen
//     app.listen(PORT, () => {          // to Start the express server only after the database connection is established.
//         console.log('server is listening to the port: ', PORT);
//     });
// });
