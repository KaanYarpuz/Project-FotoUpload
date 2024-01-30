
const { Event, User } = require('./mongo/index.js')
const { Users, ActiveUsers } = require('./sessions/index.js')
const { validateRequest, UseAdmin, setResponse, SetSession, UseSession } = require('./auth/index.js')

const useAuth = async (req, res, next) => {

    const request = req.body
    const { username, eventcode, eventid, password } = request
    const isValidRequest = await validateRequest(request);
    
    if (!isValidRequest) {
        setResponse(req, 400, "Bad Request", "The request could not be understood by the server due to malformed syntax.")
        return next();
    }

    if (ActiveUsers.get(username)) {
        setResponse(req, 409, "Conflict", "The request could not be accepted by the server due to conflict.")
        return next()
    }
    
    if (!password) {
        const user = await Event.findOne({ eventcode: eventcode, _id: eventid }).catch(err => {
            setResponse(req, 500, "Internal Server Error", "The server encountered an unexpected condition which prevented it from fulfilling the request.")
            return next()
        })

        if (!user) {
            setResponse(req, 404, "Not Found", "The server has not found anything matching the Request-URI.")
            return next()
        }

        req.sessionId = await SetSession(request)
        setResponse(req, 200, "OK", "The request has succeeded.", {
            username,
            eventname: user.title,
            eventid,
            admin: false
        })
        return next()
    } 

    const ValidAdmin = await UseAdmin(username, password)
    if (!ValidAdmin) {
        setResponse(req, 401, "Unauthorized", "The request has not been authorized because it lacks valid authentication credentials.")
        return next()
    }

    req.sessionId = await SetSession(request)
    setResponse(req, 200, "OK", "The request has succeeded.", {
        username,
        admin: true
    })
    return next()
}


const fetchEvent = async (req, res, next) => {
    const eventid = req.params.id
    const event = await Event.findById(eventid).catch((err) => {
        setResponse(req, 500, "Internal Server Error", "The server encountered an unexpected condition which prevented it from fulfilling the request.")
        return next()
    })

    if (!event) {
        setResponse(req, 404, "Not Found", "The server has not found anything matching the Request-URI.")
        return next()
    }

    setResponse(req, 200, "OK", "The request has succeeded.", event)
    return next()
}


const fetchUser = async (req, res, next) => {
    const User = await UseSession(req)

    if (!User) {
        setResponse(req, 401, "Unauthorized", "The request has not been authorized because it lacks valid authentication credentials.")
        return next()
    }

    setResponse(req, 200, "OK", "The request has succeeded.", User)

    next()
}

const useUser = async (req, res, next) => {

    const User = await UseSession(req)
    if (!User) {
        setResponse(req, 401, "Unauthorized", "The request has not been authorized because it lacks valid authentication credentials.")
        return next()
    }

    setResponse(req, 200, "OK", "The request has succeeded.", User)
    return next()
}

module.exports = {
    useUser, useAuth, fetchEvent, fetchUser
}