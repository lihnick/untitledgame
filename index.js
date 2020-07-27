'use strict';

const GameLevel = require('./constants.js');
const session = require('express-session');
const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const uuid = require('uuid');
const cors = require('cors');
const ws = require('ws');
const app = express();
const port = process.env.PORT || 8000;

/*
    client = {
        id1: { id1, username, websocket, position: {x1, z1} },
        id2: { id2, username, websocket, position: {x2, z2} },
        id3: { id3, username, websocket, position: {x3, z3} },
        id4: { id4, username, websocket, position: {x4, z4} }
    }
*/
let client = {};

/*
    There are no traps at the start of the game.
    Player score points by moving to the end pillar.
    Round X player move about setting traps for round X+1.
    Player win by having the highest points after L rounds.
    lobby = {
        spawn: [{x1, z1}, {x2, z2}, {x3, z3}, {x4, z4}],
        started: true/false,
        round: 1...N,
        roundEnd: Date.now() + 5 * 60 * 60
    }
*/
let lobby = {};

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
        // Check if message can be parse and valid format
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
            // New Player joining will need to update current client with their data
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
            // When a player clicks start game when in a lobby
            else if ('StartGame' == data['type']) {
                console.log('Start Game', GameLevel);
                // Get a list of player ids for players that have joined the lobby
                let playerIds = Object.keys(client)
                    .filter(key => ('username' in client[key]))
                    .map(key => client[key]['id']);
                
                lobby['spawn'] = [];
                // Parse the spawn locations available for a given map
                for (let x = 0; x < GameLevel['ForestLevel']['size'][0]; x++) {
                    for (let z = 0; z < GameLevel['ForestLevel']['size'][1]; z++ ) {
                        if (GameLevel['ForestLevel']['Terrain'][x][z] === 0) {
                            lobby['spawn'].push({'x': x, 'z': z});
                        }
                    }
                }

                // Set player spawn locations
                for (let i = 0; i < lobby['spawn'].length && i < playerIds.length; i++) {
                    client[playerIds[i]]['position'] = lobby['spawn'][i];
                }
                // lobby['spawn'].forEach((locations, index) => {
                //     console.log(locations, index, playerIds[index], client[playerIds[index]]);
                //     client[playerIds[index]]['position'] = locations;
                // });

                // Set initial data needed to start a game
                for (let key in client) {
                    if ('username' in client[key]) {
                        client[key]['websocket'].send(JSON.stringify({
                            'type': 'StartGame',
                            'id': key,
                            'map': GameLevel['ForestLevel'],
                            'players': Object.keys(client)
                                .filter(key => ('username' in client[key]))
                                .map(key => ({
                                    'id': client[key]['id'],
                                    'position': client[key]['position']
                                }))
                        }));
                    }
                }
                if (!lobby['started']) {
                    lobby['started'] = true;
                    lobby['round'] = 1;
                    lobby['roundEnd'] = Date.now() + 5 * 60 * 60 + 10000;
                    // Call once to indicate start of the game
                    setTimeout(() => {
                        console.log('Starting Game Round:', lobby['round']);
                        Object.keys(client).forEach(key => {
                            if ('username' in client[key]) {
                                client[key]['websocket'].send(JSON.stringify({
                                    'type': 'StartRound',
                                    'round': lobby['round'],
                                    'end': lobby['roundEnd']
                                }));
                            }
                        });
                    }, 10000);
                }
            }
            else if ('PlayerMove' == data['type']) {
                if (data['id'] in client) {
                    client[data['id']].position.x += data['vector'].x;
                    client[data['id']].position.z += data['vector'].z;
                    for (let key in client) {
                        client[key]['websocket'].send(JSON.stringify({
                            'type': 'PlayerMove',
                            'id': data['id'],
                            'vector': client[data['id']].position
                        }));
                    }
                } else {
                    console.warn('Unknown id movement:', data);
                }
                // console.log('Player Move:', data);
                // for (let key in client) {
                //     client[key]['websocket'].send(JSON.stringify(data));
                // }
                // will need to check if movement triggers any traps/collision
            } else {
                console.log('Unrecognize data type:', data);
            }
        } else {
            console.log('Unknown data format:', data);
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
        if (Object.keys(client).length === 0) {
            console.log('All Players have left, resetting Lobby variables');
            lobby['spawn'] = [];
            lobby['started'] = false;
            lobby['round'] = 0;
        }
        console.log(Object.keys(client).length);
    });

    ws.on('error', (err) => {
        console.log(`Error: ${err}`);
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));