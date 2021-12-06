class Room{
    player1
    player2
    message(data){
        this.player1.send(data)
        this.player2.send(data)
    }
    constructor(player1, player2, p1white) {
        this.player1 = player1
        this.player2 = player2
    }
}

const sock = require('ws')
const wss = new sock.Server({ port: 8080 })
let waitingPlayer
let freeRoom = false
wss.on('connection', ws => {
    console.log("connect")
    ws.on('message', data => {
        const arr = data.toString().split('|')
        switch (arr[0]){
            case "find":
                if(!freeRoom) waitingPlayer = ws
                else{
                    const currentRoom = new Room(waitingPlayer, ws, Math.random() > 0.5)
                    waitingPlayer.emit('start-game', currentRoom)
                    ws.emit('start-game', currentRoom)
                    waitingPlayer = null
                }
                freeRoom = !freeRoom
                ws.on('close', () => {
                    console.log('disc')
                })
        }
    })
})
wss.on('listening', () => {
    console.log('listening on 8080')
})
