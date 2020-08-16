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


app.get('/searchMatches', (request, response) => {


    response.render('search-matches')
});

app.get('/about-us', (request, response) => {


    response.render('about-us')
});

app.post('/', saveUser);

// app.listen(PORT, () => { // to Start the express server only after the database connection is established.
//     console.log('server is listening to the port: ', PORT);
// });

// let handleError = (err, res) => {
//     res.render('/pages/error', {error: `Something's wrong, ${err}`})
// }
function saveUser(req,res){
    console.log(req.body)
  let {username,email,psw} = req.body;
  let SQL = 'INSERT into account(username,email,psw) VALUES ($1, $2, $3);';
  let values = [username,email,psw];

  return client.query(SQL, values).then( ()=>{
    let SQL2 = 'SELECT * FROM account WHERE email = $1;';
    let values2 = [req.body.email];
    return client.query(SQL2,values2).then( data => {
        console.log(req.body, data.rows[0])
    res.redirect(`/${data.rows[0].id}`);
      }).catch(err => console.log('first',err));
    }).catch(err => console.log(err));
}

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
    console.log('connected')          // this is a promise and we need to start the server after it connects to the database
    // app.listen
    app.listen(PORT, () => {          // to Start the express server only after the database connection is established.
        console.log('server is listening to the port: ', PORT);
    });
});