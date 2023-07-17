const { nanoid } = require("nanoid")

// setting up a DB
const low = require("lowdb")
const FileSync = require("lowdb/adapters/FileSync")

const adapter = new FileSync('db/message.json')
const db = low(adapter)

// writting start data in DB
db.defaults({
    messages: [
        {
            messageId: '1',
            userId: '1',
            senderName: 'Rick',
            messageText: 'Hey, good morning, folks! Today, I got a bit lost on the path of life…',
            createdAt: '2023-07-23'
        },
        {
            messageId: '2',
            userId: '2',
            senderName: 'Ash',
            messageText: 'Go back to work!',
            createdAt: '2023-07-23'
        },
    ]
}).write()

module.exports = (io, socket) => {
    // handling GET message request
    const getMessages = () => {
        // getting messages from DB
        const messages = db.get('meassages').value()
        
        // providing message to users, thats are in room
        io.in(socket.roomId).emit('messages', messages)
    }

    // handling POST message request
    const addMessage = (message) => {
        db.get("message")
        .push({
            // generating an indefier through nanoid with length arg(8)
            messageId: nanoid(8),
            createdAt: new Date(),
            ...message
        })
        .write()

        // getting updated data
        getMessages()
    }
    
    // handling DELETE message request
    const removeMessage = (messageId) => {
        db.get("messages").remove({ messageId }).write()

        getMessages()
    }

    // registering handlers
    socket.on('message:get', getMessages)
    socket.on('message:add', addMessage)
    socket.on('message:remove', removeMessage)
}