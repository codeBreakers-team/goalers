'use strict'
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
require('dotenv').config();
const PORT = process.env.PORT || 3000;
app.use(express.static('./public'));
app.use(express.urlencoded({extended : true}));
app.set('view engine', 'ejs');
const pg = require('pg');  // sql first step in intializing
const superagent = require('superagent');
const { response, query } = require('express');
const client = new pg.Client(process.env.DATABASE_URL);
const methodOverride = require('method-override');
app.use(methodOverride('_method'));


app.get('/aaaaa', (req, res) => {  // home page
    getLastMatches();
        //res.render('index', {booksResult: bookArr});
    });
    


    function getLastMatches() {
        console.log('inside func');
        let url = `https://www.scorebat.com/video-api/v1/`;
        return superagent.get(url).then(data => {
            let matchData= data.body.map(lastMatch);
           console.log("inside superagent", data.body[0]);
        //   let matchesData= data.body.forEach(match =>{
        //       console.log('inside foreach', match);
        //      return new lastMatch(match);
        //    });
           console.log(matchesData);
           // console.log(data.body);

            return matchesData;
        });
    }

    function LastMatch(match) {
        this.title = match.title;
        this.embed = match.embed;
        this.thumbnail = match.thumbnail;
        this.team1 = match.side1.name;
        this.team2 = match.side2.name;
        return this;
    }


/////
    app.get("/", (request, response) => {

        let link = `https://www.scorebat.com/video-api/v1/`;
        superagent.get(link)
            .then((returnedData) => {
                let matchesArr=[];
                for(let i = 0; i<5; i++){
                   
                    matchesArr.push(new LastMatch(returnedData.body[i]));
                }
                console.log(matchesArr);
                response.render('index', { latestMatches: matchesArr });
            });
    });
/////



// client.connect().then(() => {           // this is a promise and we need to start the server after it connects to the database
//     // app.listen
//     app.listen(PORT, () => {          // to Start the express server only after the database connection is established.
//         console.log('server is listening to the port: ', PORT);
//     });
// });
app.listen(PORT, () => {          
             console.log('server is listening to the port: ', PORT);
         });