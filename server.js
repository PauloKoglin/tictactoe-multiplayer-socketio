
const port = 3000
const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http);
const games = new Array()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("."))

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
    socket.on('player-connected', (room, player) => {
        game = games.find(element => element.room === room)

        if (game) {
            socket.join(room)
            game.players.push(player)

            if (game.players.length == 2) {
                io.to(game.room).emit(`${room}-start`, game.players);
            }
            console.log(player.name + ' connected to room ' + room);
        }

    });

    socket.on('played-cell', (room, cell, player) => {
        io.to(room).emit(`${room}-played`, cell, player);
    });
});

http.listen(process.env.PORT || port, () => console.log("Running on " + port))