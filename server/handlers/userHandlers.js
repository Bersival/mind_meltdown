// DB imitation
const users = {
    1: {username: 'Rick', online: false},
    2: {username: 'Bob', online: false}
}

module.exports = (io, socket) => {
    // handling GET users request(roomId property is distributed, because is used for users and messages either)
    const getUsers = () => {
        io.in(socket.roomId).emit('users', users)
    }

    // handling POST user request
    const addUser = ({ username, userId }) => {
        // checking if user in DB
        if(!users[userId]) {
            // if not adding it to the database
            users[userId] = {username, online: true}
        }
        else {
            // if it is, switching online status from false on true
            users[userId].online = true
        }
        // getting users
        getUsers()
    }

    // handling DELETE user request
    const removeUser = (userId) => {
        users[userId].online = false
        getUsers()
    }

    socket.on('user:get', getUsers)
    socket.on('user:add', addUser)
    socket.on('user:leave', removeUser)
}