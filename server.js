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



app.get('/', (req, res) => {
    res.render('./index.ejs');
});

app.listen(PORT, () => {          // to Start the express server only after the database connection is established.
    console.log('server is listening to the port: ', PORT);
});


// client.connect().then(() => {           // this is a promise and we need to start the server after it connects to the database
//     // app.listen
//     app.listen(PORT, () => {          // to Start the express server only after the database connection is established.
//         console.log('server is listening to the port: ', PORT);
//     });
// });