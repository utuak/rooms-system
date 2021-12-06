class Room{
    player1
    player2
    p1white
    mess(data){
        this.player1.send(data)
        this.player2.send(data)
    }
    raise(data, f){
        if(f) this.player2.send(data)
        else this.player1.send(data)
    }
    throwResult(ri){
        this.player1.send("end|" + ri)
        this.player2.send("end|" + !ri)
    }
    constructor(player1, player2, p1white) {
        this.player1 = player1
        this.player2 = player2
        this.p1white = p1white
    }
}

const sock = require('ws')
const wss = new sock.Server({ port: 8080 })
let waitingPlayer
let freeRoom = false
wss.on('connection', ws => {
    console.log("connect")
    let socketRoom
    let abortStep //boolean
    let first
    ws.on('start-game', room => {
        socketRoom = room
        ws.send("start|" + '|' + socketRoom.p1white + '|')
        console.log("start")
    })
    ws.on('message', data => {
        const arr = data.toString().split('|')
        switch (arr[0]){
            case "find":
                if(!abortStep){
                    console.log("find")
                    if(!freeRoom) waitingPlayer = ws
                    else{
                        const currentRoom = new Room(waitingPlayer, ws, Math.random() > 0.5)
                        waitingPlayer.emit('start-game', currentRoom)
                        ws.emit('start-game', currentRoom)
                        waitingPlayer = null
                    }
                    freeRoom = !freeRoom
                    first = freeRoom
                    ws.on('close', () => {
                        console.log('disc')
                        if(first) socketRoom.player2.send("win")
                        else socketRoom.player1.send("win")
                        abortStep = false
                    })
                }
                else waitingPlayer = null
                abortStep = !abortStep
                break
            case "move":
                console.log(arr[1])
                socketRoom.mess("move|" + arr[1])
                break
            case "end":
                socketRoom.mess("draw")
                break
        }
    })
})
wss.on('listening', () => {
    console.log('listening on 8080')
})