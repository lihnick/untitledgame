'use strict';

const GameLevel = require('./map.js');
const session = require('express-session');
const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const uuid = require('uuid');
const cors = require('cors');
const ws = require('ws');
const app = express();
const client = {};
const port = process.env.PORT || 8000;

// Need to have the same instance of session parser in express and WebSocket server.
const sessionParser = session({
    saveUninitialized: false,
    secret: 'nothing',
    resave: false
});

app.use(cors());
app.use(express.static('public'));
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // allow use to read the body section of a request
app.use(sessionParser);

const server = http.createServer(app);
const wss = new ws.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
    console.log('Parsing session from request...');
    sessionParser(request, {}, () => {
        const id = uuid.v4();
        request.session['userId'] = id;
        client[id] = {'id': id};
        wss.handleUpgrade(request, socket, head, (ws) => {
            console.log('upgrade connect to websockets');
            wss.emit('connection', ws, request);
        });
    });
});

wss.on('connection', (ws, req) => {
    let id;
    if ('userId' in req.session) {
        id = req.session['userId'];
        client[id]['websocket'] = ws;
    } else {
        console.warn('New User without id!');
        ws.close();
    }

    ws.on('message', (message) => {
        console.log(`User ${id} Sent`);
        let data;
        try {
            data = JSON.parse(message);
        } catch (err) {
            console.log(`Parse Error: ${err}`);
            return;
        }
        console.log(data);
        if (data && 'type' in data) {
            if ('Username' == data['type']) {
                for (let key in client) {
                    // New clients need all other client info
                    if (key == id) {
                        client[id]['username'] = data['username'];
                        let payload = {
                            'type': 'AllUser',
                            'self': id,
                            'users': Object.keys(client)
                            .filter(key => ('username' in client[key]))
                            .map(key => ({
                                'id': client[key]['id'],
                                'username': client[key]['username']
                            }))
                        }
                        client[key]['websocket'].send(JSON.stringify(payload));
                    } 
                    // Current clients needs only new client info
                    else if ('username' in client[key]) {
                        client[key]['websocket'].send(JSON.stringify({
                            'type': 'AddUser',
                            'id': id,
                            'username': data['username']
                        }))
                    }
                }
            }
            if ('StartGame' == data['type']) {
                console.log('Start Game', GameLevel);
                for (let key in client) {
                    if ('username' in client[key]) {
                        client[key]['websocket'].send(JSON.stringify({
                            'type': 'StartGame',
                            'id': key,
                            'map': GameLevel['Forest']
                        }));
                    }
                }
            }
        }
    });

    ws.on('close', () => {
        for (let key in client) {
            if (key == id || !('username' in client[key]) ) continue;
            console.log(`Del User ${client[id]['username']} Sending to ${client[key]['username']}`);
            client[key]['websocket'].send(JSON.stringify({
                'type': 'DelUser',
                'id': id,
                'username': client[id]['username']
            }));
        }
        console.log(`Connection to ${id} closed.`);
        delete client[id];
        console.log(Object.keys(client).length);
    });

    ws.on('error', (err) => {
        console.log(`Error: ${err}`);
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));