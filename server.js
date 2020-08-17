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

//Home Page Route
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
//////////////////////////// User
app.post('/signup', signUser);
app.post('/login', logUser);
app.get('/logout', logout);
app.get('/profile', profile);

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

function profile (req,res){
    
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

//about us page route
app.get('/about-us', (request, response) => {
    response.render('about-us')
});

// app.listen(PORT, () => { // to Start the express server only after the database connection is established.
//     console.log('server is listening to the port: ', PORT);
// });

function getLastMatches() {
    console.log('inside func');
    let url = `https://www.scorebat.com/video-api/v1/`;
    return superagent.get(url).then(data => {
        let matchData = data.body.map(lastMatch);
        return matchesData;
    });
}



client.connect().then(() => { 
          // this is a promise and we need to start the server after it connects to the database
    app.listen(PORT, () => {          // to Start the express server only after the database connection is established.
        console.log('server is listening to the port: ', PORT);
    });
});

