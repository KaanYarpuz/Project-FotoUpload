const { Event, User } = require('./mongo/index.js')
const { Users, ActiveUsers } = require('./sessions/index.js')
const { validateRequest, UseAdmin, setResponse, SetSession, UseSession } = require('./auth/index.js')

const useUserCheck = (data) => {
    return async (req, res, next) => {
        const sessionId = req.cookies.Token;
        const user = Users.get(sessionId);

        if (!user) return res.status(401).json({
            statusCode: 401,
            statusMessage: "Unauthorized",
            message: "Het verzoek is niet geautoriseerd omdat het geen geldige authenticatiegegevens bevat."
        });

        if (data.admin && !user.admin) return res.status(403).json({
            statusCode: 403,
            statusMessage: "Forbidden",
            message: "De server begreep het verzoek, maar weigert het te autoriseren."
        });

        req.response = {
            statusCode: 200,
            statusMessage: "OK",
            message: "Het verzoek is geslaagd.",
            data: user
        }

        return next()
    }
}


const useAuth = async (req, res, next) => {

    const request = req.body
    const { username, eventcode, eventid, password } = request
    const isValidRequest = await validateRequest(request);

    if (!isValidRequest) {
        setResponse(req, 400, "Foute aanvraag", "Het verzoek kon niet worden begrepen door de server vanwege ontbrekende velden.")
        return next();
    }

    if (ActiveUsers.get(username)) {
        setResponse(req, 409, "Conflict", "Het verzoek kon niet worden geaccepteerd door de server vanwege een conflict.")
        return next()
    }

    if (eventcode && eventid?.trim()) {

        const TrimedId = eventid?.trim()

        if (username == "") {
            setResponse(req, 400, "Foute aanvraag", "Het verzoek kon niet worden begrepen door de server vanwege ontbrekende velden.")
            return next()
        }

        const activeEvent = await Event.findById(TrimedId).catch(err => {
            setResponse(req, 500, "Interne serverfout", "De server heeft een onverwachte fout ondervonden waardoor het verzoek niet kon worden voltooid.")
            return next()
        })

        if (!activeEvent) {
            setResponse(req, 404, "Niet gevonden", "De server heeft niets gevonden dat overeenkomt met de Request-URI.")
            return next()
        }

        const event = await Event.findOne({ eventcode: eventcode, _id: TrimedId }).catch(err => {
            setResponse(req, 500, "Interne serverfout", "De server heeft een onverwachte fout ondervonden waardoor het verzoek niet kon worden voltooid.")
            return next()
        })

        if (!event) {
            setResponse(req, 401, "Niet geautoriseerd", "Het verzoek is niet geautoriseerd omdat het geen geldige authenticatiegegevens bevat.")
            return next()
        }

        req.sessionId = await SetSession(request)
        setResponse(req, 200, "OK", "Het verzoek is geslaagd.", {
            username,
            eventname: event.title,
            eventid: TrimedId,
            admin: false
        })
        return next()
    }

    if (username == "") {
        setResponse(req, 400, "Foute aanvraag", "Het verzoek kon niet worden begrepen door de server vanwege ontbrekende velden.")
        return next()
    }

    const ValidAdmin = await UseAdmin(username, password)
    if (!ValidAdmin) {
        setResponse(req, 401, "Niet geautoriseerd", "Het verzoek is niet geautoriseerd omdat het geen geldige authenticatiegegevens bevat.")
        return next()
    }

    const user = await User.findOne({ username }).catch(err => {
        setResponse(req, 500, "Interne serverfout", "De server heeft een onverwachte fout ondervonden waardoor het verzoek niet kon worden voltooid.")
        return next()
    })

    req.sessionId = await SetSession(user)
    setResponse(req, 200, "OK", "Het verzoek is geslaagd.", {
        username,
        admin: true
    })
    return next()
}


const fetchEvent = async (req, res, next) => {
    const eventid = req.params.id
    const event = await Event.findById(eventid).catch((err) => {
        setResponse(req, 500, "Interne serverfout", "De server heeft een onverwachte fout ondervonden waardoor het verzoek niet kon worden voltooid.")
        return next()
    })

    if (!event) {
        setResponse(req, 404, "Niet gevonden", "De server heeft niets gevonden dat overeenkomt met de Request-URI.")
        return next()
    }

    setResponse(req, 200, "OK", "Het verzoek is geslaagd.", event)
    return next()
}

const showevents = async (req, res, next) => {
    const data = await Event.find({ CreatedById: req.response.data.userid })
    return data
}

const fetchUser = async (req, res, next) => {
    const User = await UseSession(req)

    if (!User) {
        setResponse(req, 401, "Niet geautoriseerd", "Het verzoek is niet geautoriseerd omdat het geen geldige authenticatiegegevens bevat.")
        return next()
    }

    setResponse(req, 200, "OK", "Het verzoek is geslaagd.", User)
    next()
}

const useUser = async (req, res, next) => {

    const User = await UseSession(req)
    if (!User) {
        setResponse(req, 401, "Niet geautoriseerd", "Het verzoek is niet geautoriseerd omdat het geen geldige authenticatiegegevens bevat.")
        return next()
    }

    setResponse(req, 200, "OK", "Het verzoek is geslaagd.", User)
    return next()
}

module.exports = {
    useUser, useAuth, fetchEvent, fetchUser, showevents, useUserCheck
}