require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const port = process.env.PORT;
const cors = require('cors')


//establish connection 
require('./server/connection')

//initialize app 
var app = express();

//to get data form post/get request 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

//get access file path
// app.use('/files', express.static(__dirname + '/server/assets/'))

//get access file path
app.use('/files', express.static(__dirname + '/server/assets/'))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'server/views/'));
})

var admin = require('./server/routes/admin')
app.use(process.env.API_V1 + 'admin', admin);

var users = require('./server/routes/users')
app.use(process.env.API_V1 + 'users', users);

app.listen(port, () => {
    console.log(`server running on port ${port}`);
});

