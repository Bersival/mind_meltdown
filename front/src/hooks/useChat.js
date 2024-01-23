import { useEffect, useRef, useState } from "react"
// getting IO class
import io from "socket.io-client"
import { nanoid } from "nanoid"

// hooks import
import { useLocalStorage, useBeforeUnload } from "hooks"

// server url(request re-routing is required)
const SERVER_URL = 'http://localhost:5000'

// this hook takes roomId
export const useChat = (roomId) => {
    // local state for users
    const [users, setUsers] = useState([])

    // local state for messages
    const [messages, setMessages] = useState([])

    // creating and writting userId to localStorage
    const [userId] = useLocalStorage('userId', nanoid(8))

    // getting username from localStorage
    const [username] = useLocalStorage('username')

    // useRef() is used not only for getting direct access to DOM-elements,
    // but for storing anything mutable values for a whole component life cycle
    const socketRef = useRef(null)

    useEffect(() => {
        // creating socket instance and providing a server address and writting object with roomId in "handshake" request string
        // socket.handshake.query.roomId
        socketRef.current = io(SERVER_URL, {
            query: { roomId }
        })
        
        // sending add(POST) user event providing object with username and userId
        socketRef.current.emit('user:add', { username, userId })
        
        // handling GET users request
        socketRef.current.on('users', (users) => {
            // updating user array
            setUsers(users)
        })

        // sending GET messages request
        socketRef.current.emit('message:get')

        // handling GET messsages request
        socketRef.current.on('messages', (messages) => {
            // defining which messages was sent current by current user
            // adding "currentUser: true" in object IF userId value of object equals to user id
            // otherwise the function will just return message object
            const newMessages = messages.map((msg) => 
                msg.userId === userId ? {...msg, currentUser: true} : msg
            )
            // updating messages array
            setMessages(newMessages)
        })

        return () => {
            // executing socket disconnection when component unmount
            socketRef.current.disconnect()
        }
    }, [roomId, userId, username])

    // this function takes an object with message text and sender name
    const sendMessage = ({messageText, senderName}) => {
        // adding user data to an object when send it to a server
        socketRef.current.emit('message:add', {
            userId,
            messageText,
            senderName
        })
    }

    const removeMessage = (id) => {
        socketRef.current.emit('message:remove', id)
    }

    // sending "user:leave" event to a server before page reloading
    useBeforeUnload(() => {
        socketRef.current.emit('user:leave', userId)
    })

    // the hook returns users, messages and fucntions for sending and deleting messages
    return {users, messages, sendMessage, removeMessage}
}