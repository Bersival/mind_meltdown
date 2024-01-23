// creating a server
const server = require("http").createServer()
// connecting to Socket.io server
const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
})

// gettin event handlers
const registerMessageHandlers = require('./handlers/messageHandlers')
const registerUserHandlers = require('./handlers/userHandlers')

// this function is executed on each socket connection(usually one client equals one socket)
const onConnection = (socket) => {
    console.log("user connected")

    // getting a room name from handshake request string
    const { roomId } = socket.handshake.query

    // saving a room name in accordance with the properties of the socket
    socket.roomId = roomId

    // joining to room
    socket.join(roomId)

    // registering handlers
    // note: take a look on providing args
    registerMessageHandlers(io, socket)
    registerUserHandlers(io, socket)

    // handling socket(user) disconnect
    socket.on("disconnect", () => {
        console.log("User disconnected")
        
        // leaving a room
        socket.leave(roomId)
    })
}

// handling connection
io.on('connection', onConnection)

// running a server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})