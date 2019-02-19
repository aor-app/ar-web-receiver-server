'use strict';
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const fs = require('fs');
const cors = require('cors');

const authenticator = require('./lib/authenticator');
const receiverAPI = require('./routes/receiver-api');
const receiverSocket = require('./routes/receiver-socket');
const adapterAPI = require('./routes/adapter-api');

const AR_WEB_RECEIVER_CLIENT_PATH = path.resolve('../ar-web-receiver-client');
const sessionParser = session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    name: 'sid',
    cookie: {
        maxAge: 1000*60*60*24*30
    }
});
const corsOption = {
    origin: true,
    methods: ['GET', 'HEAD', 'POST'],
    allowedHeaders: ['Content-Type'],
    preflightContinue: true,
    credentials: true
};
app.use(cors(corsOption));

app.use(sessionParser);
app.use(helmet());

app.options('*', (req, res) => {
  res.sendStatus(200);
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(AR_WEB_RECEIVER_CLIENT_PATH));
app.get('/',
        (req, res) => {
            res.redirect('/login.html');
        });
app.use('/api/receiver', receiverAPI.router);
app.use('/api/adapter', adapterAPI.router);

server.listen(3000, async ()  => {
    const arReceiver = await receiverAPI.initialize();
    receiverSocket(server, sessionParser, arReceiver);
    adapterAPI.initialize(arReceiver);
    console.log('Server started.');
});
