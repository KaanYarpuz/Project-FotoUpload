const bcrypt = require('bcrypt');
const { User } = require('../mongo/index.js')
const { Users, ActiveUsers } = require('../sessions/index.js');


const validateRequest = async (request) => {
    if (Object.keys(request).length === 0) return false
    const { username, eventcode, eventid, password } = request;

    if (UseAdmin(username, password)) return true
    return (username && eventcode && eventid?.trim())
}

const UseAdmin = async (username, password) => {
    const user = await User.findOne({ username })
    if (!user) return false

    const passwordMatch = await bcrypt.compare(password, user.password).catch(err => false)
    return passwordMatch
}

const setResponse = (req, statusCode, statusMessage, message, data = undefined) => {
    req.response = {
        statusCode,
        statusMessage,
        message,
        data
    }
}
const SetSession = async (user) => {

    const SessionId = crypto.randomUUID()
    Users.set(SessionId, { 
        userid: user.id || undefined,
        eventid: user.eventid?.trim() || undefined,
        username: user.username,
        admin: user.password ? true : false,
        eventcode: undefined,
        password: undefined 
    })
    ActiveUsers.set(user.username, SessionId)

    setTimeout(() => {
        ActiveUsers.delete(user.username);
        Users.delete(SessionId);
    }, 12 * 60 * 60 * 1000); 

    return SessionId
}

const UseSession = async (req) => {

    const SessionId = req.cookies.Token

    if (!SessionId) return false
    return Users.get(SessionId)
}


module.exports = {
    validateRequest,
    UseAdmin,
    setResponse,
    SetSession,
    UseSession
}