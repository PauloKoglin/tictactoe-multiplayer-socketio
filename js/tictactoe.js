function Game(roomID) {
    this.simbol = ["empty", "circle", "cross"]
    this.players = new Array()
    this.activePlayer = null
    this.room = roomID
    this.winner = null
    this.tabulary = new Tabulary()

    const playAgain = new Array()
    const gameArea = document.getElementById("gameArea")

    this.addPlayer = (player) => this.players.push(player)

    this.setWinner = (player) => {
        this.winner = player
        this.showMessage(`${this.winner.name} won the game!`)
        this.askToPlayAgain()
        // this.tabulary.reset() TODO
    }

    this.playAgain = (choice) => {
        playAgain.push(choice)
        if (playAgain.length === 2 && !playAgain.indexOf(false)) {
            // The winner starts playing the next game
            game.startGame(this.winner)
        }
    }

    this.setActivePlayer = (player) => {
        this.activePlayer = player
        this.showMessage(`${player.name}, you play!!!`)
    }

    this.nextPlayer = () => this.setActivePlayer(this.activePlayer.name === this.players[0].name ? this.players[1] : this.players[0])

    this.playerWins = (player, combination) => {
        this.setWinner(player)
        this.tabulary.showWinner(combination)
    }

    this.startGame = (startPlayer) => {
        // playAgain.splice(0)
        this.tabulary.reset()
        this.setActivePlayer(startPlayer)
    }

    this.showMessage = (message, infinite) => {
        messageBox = document.getElementById("messageBox")
        messageBox.innerHTML = message
        messageBox.removeAttribute("hidden")
        messageBox.style.animationName = "messageAnimation"
        messageBox.style.animationDuration = "3s"
        messageBox.style.animationIterationCount = infinite ? "infinite" : "unset";
        messageBox.style.animationFillMode = "forwards"
    }

    this.askToPlayAgain = function () {
        // let playAgain = document.getElementById("playAgain")
        // playAgain.removeAttribute("hidden")

        // let noThanks = document.getElementById("noThanks")
        // noThanks.removeAttribute("hidden")

        // socket.emit('player-connected', room, player);
    }

    this.createTabulary = function () {
        let tabulary = document.createElement("div")
        tabulary.id = "tabulary"
        tabulary.setAttribute("class", "container-row")

        let askBtns = document.createElement("div")
        askBtns.id = "askButtons"
        askBtns.setAttribute("class", "container-row")

        let againBtn = document.createElement("button")
        againBtn.id = "playAgain"
        againBtn.innerHTML = "Play Again"
        againBtn.setAttribute("class", "greenButton")
        againBtn.setAttribute("hidden", "")
        againBtn.onclick = (e) => socket.emit('play-again', true, this.room, myPlayer)
        askBtns.appendChild(againBtn)

        let noThanksBtn = document.createElement("button")
        noThanksBtn.id = "noThanks"
        noThanksBtn.innerHTML = "No, Thanks!"
        noThanksBtn.setAttribute("class", "redButton")
        noThanksBtn.setAttribute("hidden", "")
        noThanksBtn.onclick = (e) => socket.emit('play-again', false, this.room, myPlayer)
        askBtns.appendChild(noThanksBtn)

        let playersArea = document.createElement("div")
        playersArea.id = "players"
        playersArea.setAttribute("class", "container-row")
        playersArea.style.paddingTop = "20px"

        this.players.forEach(player => {
            let p = document.createElement("div")
            p.setAttribute("class", "container-col")
            p.innerHTML = `<div>${player.name}</div><img src="${player.simbolImg}"></img>`
            playersArea.appendChild(p)
        })

        for (let i = 0; i < 3; i++) {
            div = document.createElement("div")
            div.setAttribute("class", "container-col")
            for (let j = 0; j < 3; j++) {
                cell = new Cell(j, i)
                this.tabulary.setCell(j, i, cell)
                div.appendChild(cell.element)
            }

            tabulary.appendChild(div)
        }

        gameArea.appendChild(tabulary)
        gameArea.appendChild(askBtns)
        gameArea.appendChild(playersArea)
    }

    this.initialize = function () {
        gameArea.innerHTML = ""

        let messages = document.createElement("div")
        messages.setAttribute("class", "container-row")
        messages.id = "messageBox"
        messages.hidden
        gameArea.appendChild(messages)

        let session = document.createElement("div")
        session.setAttribute("class", "container-row room")
        session.innerHTML = "Game Room " + this.room
        session.style.fontFamily = "Courier"

        gameArea.appendChild(session)

        this.showMessage("Waiting for secound player...", "infinite")
    }

    this.initialize()
}

function Player(name, simbol) {
    const crossImg = "../img/cross.png"
    const circleImg = "../img/circle.png"
    this.name = name
    this.simbol = simbol
    this.simbolImg = simbol == "circle" ? circleImg : crossImg
}

function Cell(x, y) {
    const emptyImg = "../img/empty.png"
    this.player = null
    this.simbol = ""
    this.img = emptyImg
    this.position = { x, y }

    this.element = document.createElement("img")
    this.element.src = this.img
    this.element.cellX = this.position.x
    this.element.cellY = this.position.y

    this.setEmptyImg = () => this.img = emptyImg

    this.setCellPlayer = (cell, player) => {
        cell.player = player
        cell.simbol = player.simbol
        cell.img = player.simbolImg

        cell.element.src = cell.img
        combination = game.tabulary.wins(player)
        combination ? game.playerWins(player, combination) : game.nextPlayer()
    }

    this.element.onclick = function (e) {
        if (myPlayer.name === game.activePlayer.name) {
            cell = game.tabulary.getCellByPosition(e.target.cellX, e.target.cellY)
            if (!cell.player && !game.winner) {
                socket.emit('played-cell', game.room, cell, myPlayer);
            }
        }
    }
}

function Tabulary() {
    const table =
        [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ]

    this.setCell = (x, y, cell) => table[x][y] = cell

    this.getCellByPosition = (x, y) => table[x][y]

    this.wins = (player) => {

        let combination = null
        let simbol = player.simbol
        // Check the horizontal
        for (let i = 0, match = false; i < 3; i++) {
            match = table[i][0].simbol === simbol && table[i][1].simbol === simbol && table[i][2].simbol === simbol
            if (match) return combination = [table[i][0], table[i][1], table[i][2]]
        }

        // Check the vertical
        for (let i = 0, match = false; i < 3; i++) {
            match = table[0][i].simbol === simbol && table[1][i].simbol === simbol && table[2][i].simbol === simbol
            if (match) return combination = [table[0][i], table[1][i], table[2][i]]
        }

        // Check the diagonal from left to right
        match = table[0][0].simbol === simbol && table[1][1].simbol === simbol && table[2][2].simbol === simbol
        if (match) return combination = [table[0][0], table[1][1], table[2][2]]

        // Check the diagonal from right to left
        match = table[0][2].simbol === simbol && table[1][1].simbol === simbol && table[2][0].simbol === simbol
        if (match) return combination = [table[0][2], table[1][1], table[2][0]]

        return combination
    }

    this.showWinner = (combination) => {
        combination.forEach(cell => {
            cell.element.style.animationName = "combinationAnimation"
            cell.element.style.animationDuration = "1s"
            cell.element.style.animationIterationCount = "3"
            cell.element.style.animationFillMode = "forwards"
        });
    }

    this.reset = () => {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                cell = table[j][i]
                cell.setEmptyImg()
            }
        }
    }
}

function startGame() {
    const name = document.getElementById("name").value

    axios.post("/playroom")
        .then(res => {
            room = res.data.room
            game = new Game(room)
            myPlayer = new Player(name, "cross")

            openSocket(room, myPlayer)
        })
}

function openSocket(room, player) {
    socket = io()
    socket.emit('player-connected', room, player);

    socket.on(`${room}-played`, function (cell, player) {
        cell = game.tabulary.getCellByPosition(cell.position.x, cell.position.y)
        cell.setCellPlayer(cell, player)
    });

    socket.on(`${game.room}-start`, function (players, startPlayer) {
        game.addPlayer(players[0])
        game.addPlayer(players[1])
        game.createTabulary()
        game.startGame(startPlayer)
    });

    socket.on(`${game.room}-again`, function (choice, player) {
        let msg = choice ? " play again" : " dont't play again"
        game.showMessage(player.name + msg)
        game.playAgain(choice)
    });
}

function joinGame() {
    const room = document.getElementById("room").value
    const nameToJoin = document.getElementById("nameToJoin").value

    game = new Game(room)
    myPlayer = new Player(nameToJoin, "circle")

    openSocket(room, myPlayer)
}