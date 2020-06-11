
const port = 8080
const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http);
const games = new Array()

app.use(express.static("."))
app.use(bodyParser.urlencoded({ extended: true }))

function getRandomNumber() {
    return (Math.random() * (9 - 0)).toFixed(0).toString()
}

function getRandomRoomId() {
    let random = new String()
    for (let i = 0; i < 6; i++) {
        random += getRandomNumber()
    }
    return !games.find(room => room.id === random) ? random : getRandomRoomId()
}

app.post("/playroom", (req, res) => {
    try {
        room = {
            room: getRandomRoomId(),
            players: new Array()
        }
        games.push(room)
        res.status(200).send(room)
    } catch (error) {
        res.status(401).send(error)
    }
})

io.on('connection', (socket) => {

    // socket.on('disconnect', () => {
    //     roomID = socket.handshake.query.room
    //     playerName = socket.handshake.query.player
    //     room = rooms.find(element => element.room === roomID)
    //     room.players.filter(player => player !== playerName)

    //     console.log(playerName + ' connected to room ' + roomID);
    // });

    socket.on('player-connected', (room, playerName) => {
        //  roomID = socket.handshake.query.room
        // playerName = socket.handshake.query.player
        // roomID = room
        // playerName = player
        game = games.find(element => element.room === room)

        if (game) {
            socket.join(room)
            game.players.push(playerName)

            if (game.players.length == 2) {
                io.to(game.room).emit(`${room}-start`, game.players);
            }
            console.log(playerName + ' connected to room ' + room);
        }

    });

    socket.on('played-cell', (room, cell, player) => {
        // console.log('played-cell: ' + cell + player);
        io.to(room).emit(`${room}-played`, cell, player);
    });
});

http.listen(port, () => console.log("Running on " + port))