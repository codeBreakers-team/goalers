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

var sess = {
    secret: 'save',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true,
        maxAge: 50000000
    }
}
app.use(session(sess));

const Player = require("./Models/Player").default;
const LastMatch = require("./Models/LastMatch.js").default;
const LeagueMatch = require("./Models/LeagueMatch").default;
const Match = require("./Models/Match").default;

//Home Page Route
app.get('/', getMainRoute);
//search for player Route
app.get('/searchplayer', searchPlayer);
// Player page route
app.get('/player', playerPage);
// matches page route
app.get('/matches', matchesRoute);
// get matches using team name
app.get('/searchMatchesByTeamName', getMatchesByTeamName);
//get matches using league
app.get('/searchMatchesByLeagueName', getMatchesByLeagueName);
//about us page route
app.get('/about-us', aboutUsPageRoute)

//route functions
//1- Home Page Route Function
function getMainRoute(request, response) {
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
                        response.render('index', { latestMatches: matchesArr, leagues: allLeaguesObj, user: (sess.username ? sess.username : '') });
                    }
                });
            }
        })
        // .then((allLeaguesObj) => {
        //     console.log(allLeaguesObj);
        //     response.send(allLeaguesObj);
        // });
}

//2- search for player Route function
function searchPlayer(request, response) {
    let playerName = request.query.playerName;
    let searchResult = false;
    let link = `https://www.thesportsdb.com/api/v1/json/1/searchplayers.php?p=${playerName}`;
    superagent.get(link).then((returnedData) => {
        var x;
        let playersArray = [];

        if (returnedData.body && returnedData.body.player && returnedData.body.player.length) {
            playersArray = returnedData.body.player.filter(item => item.strSport == 'Soccer').map(item => {
                return new Player(item);
            })
            if (playersArray.length) {
                searchResult = true;
            }
        }
        //this code is working well but the previous 2 lines are shorter
        // for (var i = 0; i < x; i++) {
        //     let item = returnedData.body.player[i];

        //     if (item.strSport == 'Soccer') {
        //         let player = new Player(item);
        //         playersArray.push(player);
        //     }
        // }

        response.render('players', { searchResult: searchResult, players: playersArray, user: (sess.username ? sess.username : '') });
    });
}

// 3- Player page route function
// function playerPage(request, response) {
//     //get all fav player link
//     let favPlayerLink = `https://www.thesportsdb.com/api/v1/json/1/searchloves.php?u=zag`;
//     // extract Ids of fav players
//     let favPlayersIds = [];
//     //result array which will be passed to ejs file
//     let playersArray = [];
//     try {
//         superagent.get(favPlayerLink).then(data => {
//             favPlayersIds = data.body.players.map(player => {
//                     // if there is no id 'No Id Provided' will be the value of id then we will filter it
//                     return player.idPlayer || 'No Id Provided';
//                 }).filter(item => {
//                     return item != 'No Id Provided';
//                 })
//                 // console.log('favPlayersIds: ', favPlayersIds);
//             let randomFavPlayerIndex = Math.floor(Math.random() * favPlayersIds.length + 1);
//             // console.log('randomFavPlayerIndex: ', randomFavPlayerIndex);
//             let getPlayerByIdLink = `https://www.thesportsdb.com/api/v1/json/1/lookupplayer.php?id=${favPlayersIds[randomFavPlayerIndex]}`;
//             superagent.get(getPlayerByIdLink).then(item => {
//                 // if (item.body.players[0].strSport == 'Soccer') {
//                 let player = new Player(item.body.players[0]);
//                 // console.log('player: ', player);
//                 playersArray.push(player);
//                 // }
//                 response.render('players', { players: playersArray });
//             })
//         })
//     } catch (error) {
//         console.log('error: ', error);
//     }
// }

// 3- Player page route function
function playerPage(request, response) {
    let playersArray = [];
    let idsStratFrom = 34145399;
    let idsEndAt = 34149690;
    let randomStart = Math.floor(Math.random() * (idsEndAt - idsStratFrom + 1)) + idsStratFrom;
    let end = randomStart + 5;
    for (var i = randomStart; i < end; i++) {
        let j = i;
        let newRandomStart = end;
        let link = `https://www.thesportsdb.com/api/v1/json/1/lookupplayer.php?id=${i}`;
        superagent.get(link).then((item, ) => {
            // console.log('item.body: ', item.body.players[0]);
            if (item.body && item.body.players && item.body.players.length) {
                let player = new Player(item.body.players[0]);
                // console.log('player: ', player);
                playersArray.push(player);
            } else {}
            // console.log('i: ', i);
            // console.log('randomStart: ', randomStart + 5);
            if (j == end - 1) {
                // console.log('j: ', j);
                // console.log('end: ', end);
                let newPlayersArray = playersArray.filter(item => { return item.strSport == 'Soccer' });
                // console.log('newPlayersArray: ', newPlayersArray)
                response.render('players', { players: newPlayersArray, user: (sess.username ? sess.username : '') });
            }
        })
    }
}

// 4- matches page route function
function matchesRoute(request, response) {
    let leaguesArray = [];
    let matchesArray = [];
    let leaguesIdsArray = [];
    let all_leaguesLink = `https://www.thesportsdb.com/api/v1/json/1/all_leagues.php`;
    superagent.get(all_leaguesLink).then(leagues => {
        //console.log('leagues.body: ', leagues.body.leagues);
        // console.log('returnedData.body: ', returnedData.body.countries);
        leagues.body.leagues.forEach(elment => {
            leaguesArray.push(elment)
            leaguesIdsArray.push(elment.idLeague)
        });
        // console.log('leaguesArray: ', leaguesArray);
        //get coming matches for random league
        // console.log('randomLeagueId: ', randomLeagueId);
        for (var i = 0; i < 10; i++) {
            let j = i;
            console.log('j: ', j);
            let link = `https://www.thesportsdb.com/api/v1/json/1/eventsnextleague.php?id=${leaguesIdsArray[i]}`;
            console.log('leagueIdlink', link);
            superagent.get(link).then(returnedData => {
                if (returnedData.body && returnedData.body.events && returnedData.body.events.length) {
                    // let event = returnedData.body.events[0];
                    // let match = new Match(event);
                    // matchesArray.push(match);
                    returnedData.body.events.forEach(event => {
                        let match = new Match(event);
                        matchesArray.push(match);
                    });
                }
                // console.log('matchesArray.length: ', matchesArray.length);
                // console.log('matchesArray: ', matchesArray);
                if (j == 9) {
                    response.render('search-matches', { matches: matchesArray, leagues: leaguesArray, user: (sess.username ? sess.username : '') });
                }
            })
        }
    })
}

// matchesArray = getMatchesUsingLeagueId(randomLeagueId, function (ok) {
//     //this will print matchesArray
//     matchesArray = ok;

//     if (matchesArray.length) {
//         console.log('matchesArray: ', matchesArray);
//         response.render('search-matches', { matches: matchesArray, leagues: leagues.body.leagues });


//     } else {
//         matchesArray = getMatchesUsingLeagueId(leaguesArray[randomIndex], function (ok) {
//             //this will print matchesArray
//             return ok;
//         })

//     }
// });

// 5- get matches using team name function
// function getMatchesByTeamName(request, response) {
//     let teamName = request.query.teamName;
//     let matchesArray = [];
//     let idsArray = [];

//     let teamNamelink = `https://www.thesportsdb.com/api/v1/json/1/searchteams.php?t=${teamName}`;
//     superagent.get(teamNamelink).then((returnedData) => {
//         // console.log('Teams result: ', returnedData.body.teams);
//         returnedData.body.teams.forEach(element => {
//             // console.log('element: ', element.idTeam);
//             idsArray.push(element.idTeam);
//         });
//         //console.log(idsArray);
//         for (var i = 0; i < idsArray.length; i++) {
//             let j = i;
//             let matchesLink = `https://www.thesportsdb.com/api/v1/json/1/eventsnext.php?id=${idsArray[i]}`;
//             superagent.get(matchesLink).then((matchesData) => {
//                 // console.log('matchesData: ', matchesData.body.events);
//                 if (matchesData.body && matchesData.body.events && matchesData.body.events.length) {
//                     matchesData.body.events.map((event) => {
//                         let match = new Match(event);
//                         matchesArray.push(match);
//                     });
//                 }
//                 if (j == idsArray.length - 1) {
//                     //console.log('matchesArray: ', matchesArray);
//                     response.render('search-matches', { matches: matchesArray, user: (sess.username ? sess.username : '') });
//                 }
//             });
//         };
//     });
// }


// 5- get matches using team name function
function getMatchesByTeamName(request, response) {
    let teamName = request.query.teamName;
    console.log('teamName: ', teamName);

    let matchesArray = [];
    let searchResult = false;
    let link = `https://www.thesportsdb.com/api/v1/json/1/searchevents.php?e=${teamName}`;

    superagent.get(link).then((returnedData) => {
        if (returnedData.body && returnedData.body.event && returnedData.body.event.length) {
            // console.log('returnedData.body: ', returnedData.body);
            returnedData.body.event.map((event) => {
                let match = new Match(event);
                matchesArray.push(match);
            });
            // console.log('matchesArray: ', matchesArray);
            if (matchesArray.length) {
                searchResult = true;
            }
            // console.log('searchResult: ', searchResult);
            //end of if (matchesData.body && matchesData.body.events && matchesData.body.events.length) {
        }
        response.render('search-matches', { searchResult: searchResult, matches: matchesArray, user: (sess.username ? sess.username : '') });
    });
}


// 6- get matches using league function
function getMatchesByLeagueName(request, response) {
    // console.log('request.query: ', request.query);
    let leagueId = request.query.leagueInputList;
    let searchResult = false;
    let matchesArray = [];
    // console.log('leagueId: ', leagueId);
    let leagueIdlink = `https://www.thesportsdb.com/api/v1/json/1/eventsnextleague.php?id=${leagueId}`;
    superagent.get(leagueIdlink).then((returnedData) => {
        if (returnedData.body && returnedData.body.events && returnedData.body.events.length) {
            returnedData.body.events.forEach(event => {
                let match = new Match(event);
                matchesArray.push(match);
            });
            if (matchesArray.length) {
                searchResult = true;
            }
        }
        let all_leaguesLink = `https://www.thesportsdb.com/api/v1/json/1/all_leagues.php`;
        superagent.get(all_leaguesLink).then(leagues => {
            response.render('search-matches', { searchResult: searchResult, matches: matchesArray, leagues: leagues.body.leagues, user: (sess.username ? sess.username : '') });
        })
    });
}
////////////////////////////////////////////////
app.post('/signup', signUser);
app.post('/login', logUser);
app.get('/logout', logout);
app.post('/addMatchToWishList', addMatchToWishList);
app.get('/addMatchToWishList', profile)
app.get('/:id', (req, res) => {
    res.redirect('/')
})

app.get('/profile', profile)

function signUser(req, res) {
    let { username, email, psw } = req.body;
    let SQL = 'INSERT into account(username,email,psw) VALUES ($1, $2, $3);';
    let values = [username, email, psw];
    return client.query(SQL, values).then(() => {
        let SQL2 = 'SELECT * FROM account WHERE email = $1;';
        let values2 = [req.body.email];
        return client.query(SQL2, values2).then(data => {
            res.redirect(`/${data.rows[0].id}`);
        })
    }).catch(err => console.log(err));
}


function logUser(req, res) {
    let { username, psw } = req.body;
    let SQL = 'SELECT * FROM account WHERE username = $1 AND psw = $2;';
    let values = [username, psw];
    return client.query(SQL, values).then(data => {
        if (!data.rows[0]) {
            res.render('redirect');
        } else {
            sess.username = username;
            sess.accountId = data.rows[0].id;
            res.redirect(`/:id`);
        }

    }).catch(err => console.log(err));
}

function logout(req, res, next) {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.log(err);
            } else {
                sess.username = '';
                res.redirect(`/`);
            }
        });
    }
}

function addMatchToWishList(req, res) {
    let { matchName, matchDate, matchTime, homeTeam, awayTeam } = req.body;
    let SQL = 'SELECT id FROM match WHERE matchName = $1 AND matchDate = $2 AND matchTime = $3;';
    let values = [matchName, matchDate, matchTime];
    return client.query(SQL, values).then(data => {
        if (data.rowCount === 0) {
            let SQL3 = 'INSERT into match(matchName,homeTeam,awayTeam,matchDate,matchTime) VALUES ($1, $2, $3,$4,$5);';
            let values3 = [matchName, homeTeam, awayTeam, matchDate, matchTime];
            client.query(SQL3, values3).then(() => {});
        } else {}
        let SQL4 = 'INSERT into userDetails(match_id, account_id) VALUES ((SELECT id FROM match WHERE matchName = $1 AND matchDate = $2),(SELECT id FROM account WHERE username = $3));';
        let values4 = [matchName, matchDate, sess.username];
        client.query(SQL4, values4).then(() => {});
        res.redirect(`/addMatchToWishList`);
    }).catch(err => console.log(err));
}

function profile(req, res) {
    let values = [sess.username, sess.username];
    let SQL = 'SELECT DISTINCT match.matchName, match.homeTeam, match.awayTeam, match.matchDate, match.matchTime, account.username, account.id FROM match,account,userDetails WHERE userDetails.account_id = (SELECT id FROM account WHERE username = $1) AND account.username = $2;';
    client.query(SQL, values).then(data => {
        var matchesTable = data.rows;
        res.render('profile', { matchesTable: matchesTable, user: (sess.username ? sess.username : '') });
    });
}

//////////////////////////////////
//7- about us page route function
function aboutUsPageRoute(request, response) {
    response.render('about-us', { user: (sess.username ? sess.username : '') })
};

// app.listen(PORT, () => { // to Start the express server only after the database connection is established.
//     console.log('server is listening to the port: ', PORT);
// });

client.connect().then(() => {
    // this is a promise and we need to start the server after it connects to the database
    app.listen(PORT, () => { // to Start the express server only after the database connection is established.
        console.log('server is listening to the port: ', PORT);
    });
});