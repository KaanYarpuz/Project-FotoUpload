
const Users = new Map();
const ActiveUsers = new Map();

const Event = require('../modals/events.js')
const User  = require("../modals/users.js")

const authorize = async (req, res, next) => {

    const request = req.body
    if (Object.keys(request).length === 0) {
        req.response = { 
            statusCode: 400,
            statusMessage: "Bad Request",
            message: "The request could not be understood by the server due to malformed syntax."
        }
        return next()
    }
    
    const { username, eventcode, eventname } = request
    if(!username && !eventcode && !eventname){
        req.response = { 
            statusCode: 400,
            statusMessage: "Bad Request",
            message: "The request could not be understood by the server due to malformed syntax."
        }
        return next()
    }

    const Active = ActiveUsers.get(username)
    if (Active) { 
            req.response = { 
            statusCode: 409,
            statusMessage: "Conflict",
            message: "The request could not be accepted by the server due to conflict."
        }
        return next()
    }

    const User = await Event.findOne({ eventcode: eventcode, title: eventname})
    if (!User) {
        req.response = { 
            statusCode: 404,
            statusMessage: "Not Found",
            message: "The server has not found anything matching the Request-URI."
        }
        return next()
    }

    const SessionId = crypto.randomUUID()
    Users.set(SessionId, { user: req.body })
    ActiveUsers.set(req.body.username, SessionId)

    req.sessionId = SessionId;
    req.response = { 
        statusCode: 200, 
        statusMessage: "OK",
        message: "The request has succeeded.",
        data: {
            username: username,
            eventname: eventname
        }
        
    }
    return next()
}


const ActiveUser = (req, res, next) => {
    const SessionId = req.cookies.Token
    const User = Users.get(SessionId)
    next()
}

module.exports = {
    ActiveUser, authorize
}