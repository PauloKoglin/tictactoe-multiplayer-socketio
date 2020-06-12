function Game(roomID) {
    this.simbol = ["empty", "circle", "cross"]
    this.player1 = null
    this.player2 = null
    this.activePlayer = null
    this.room = roomID
    this.winner = null
    this.tabulary = new Tabulary()

    const gameArea = document.getElementById("gameArea")

    this.setPlayer1 = (player) => this.player1 = player
    this.setPlayer2 = (player) => this.player2 = player

    this.setWinner = (player) => {
        this.winner = player
        showMessage(`${this.winner.name} won the game!!!`)
        // this.tabulary.reset() TODO
    }

    this.setActivePlayer = (player) => {
        this.activePlayer = player
        showMessage(`${player.name}, you play!!!`)
    }

    this.nextPlayer = () => this.setActivePlayer(this.activePlayer == this.player1 ? this.player2 : this.player1)

    this.playerWins = (player, combination) => {
        this.setWinner(player)
        this.tabulary.showWinner(combination)
    }

    this.startGame = () => {
        this.createTabulary()
        this.setActivePlayer(this.activePlayer = Math.random() * (1, 0) === 0 ? this.player1 : this.player2)
    }

    showMessage = (message, infinite) => {
        messageBox = document.getElementById("messageBox")
        messageBox.innerHTML = message
        messageBox.removeAttribute("hidden")
        messageBox.style.animationName = "messageAnimation"
        messageBox.style.animationDuration = "3s"
        messageBox.style.animationIterationCount = infinite ? "infinite" : "unset";
        messageBox.style.animationFillMode = "forwards"
        messageBox.style.marginLeft = `${messageBox.offsetWidth / 2 * -1}px`
    }

    this.createTabulary = function () {
        let tabulary = document.createElement("div")
        tabulary.id = "tabulary"
        tabulary.setAttribute("class", "container-row")

        players = document.createElement("div")
        players.id = "player"
        players.setAttribute("class", "container-row")

        let p1 = document.createElement("div")
        p1.setAttribute("class", "player")
        p1.innerHTML = `<div class="player">${this.player1.name}</div>`

        let img = document.createElement("img")
        img.src = this.player1.simbolImg
        p1.appendChild(img)

        players.appendChild(p1)

        let p2 = document.createElement("div")
        p2.setAttribute("class", "player")
        p2.innerHTML = `<div class="player">${this.player2.name}</div>`

        img = document.createElement("img")
        img.src = this.player2.simbolImg
        p2.appendChild(img)

        players.appendChild(p2)

        for (let i = 0; i < 3; i++) {
            div = document.createElement("div")
            div.setAttribute("class", "flex-container")
            for (let j = 0; j < 3; j++) {
                cell = new Cell(j, i)
                this.tabulary.setCell(j, i, cell)
                div.appendChild(cell.element)
            }

            tabulary.appendChild(div)
        }

        gameArea.appendChild(tabulary)
        gameArea.appendChild(players)
    }

    this.initialize = function () {
        gameArea.innerHTML = ""

        let messages = document.createElement("div")
        messages.setAttribute("class", "container-row")
        messages.innerHTML = '<div hidden id="messageBox"></div>'
        gameArea.appendChild(messages)

        let session = document.createElement("div")
        session.setAttribute("class", "container-row room")

        let div = document.createElement("div")
        div.setAttribute("class", "container-col")
        div.innerHTML = "Game Room " + this.room
        session.appendChild(div)
        gameArea.appendChild(session)

        div.style.marginLeft = `${div.offsetWidth / 2 * -1}px`
        div.style.fontFamily = "Courier"

        showMessage("Waiting for secound player...", "infinite")
    }
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
                player = game.activePlayer
                socket.emit('played-cell', game.room, cell, player);
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
                cell = Table[j][i]
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
            game.initialize()
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

    socket.on(`${game.room}-start`, function (players) {
        game.setPlayer1(players[0])
        game.setPlayer2(players[1])
        game.startGame()
    });
}

function joinGame() {
    const room = document.getElementById("room").value
    const nameToJoin = document.getElementById("nameToJoin").value

    game = new Game(room)
    game.initialize()
    myPlayer = new Player(nameToJoin, "circle")

    openSocket(room, myPlayer)
}