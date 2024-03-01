const express = require('express');
const router = express.Router();
const http = require('http');
const cron = require('node-cron');

const { fetchEvent, fetchUser, showevents } = require('../middleware/index');
const { Event } = require('../middleware/mongo/index');
const { Users, } = require('../middleware/sessions/index');

cron.schedule('*/2 * * * *', async () => {
  setTimeout(() => {
    const req = http.request(process.env.ServerUrl);
    req.on('error', (error) => {
      console.error(error);
    });
    req.end();
  }, 1000)
});

router.get('/', fetchUser, async (req, res, next) => {

  const username = req.response?.data?.username;
  const admin = req.response?.data?.admin;
  const eventid = req.response?.data?.eventid?.trim();
  let title = "Home";

  if (req.response.statusCode != 200) res.redirect('/login');
  if (admin) {

    const DataEvent = await showevents(req);
    const referer = req.headers.host;

    res.render('./home/admin', {
      DataEvent: DataEvent, URL: referer
    });
  }

  else {
    const event = await Event.findOne({ _id: eventid });
    title = event?.title
    res.render('./home/gebruiker', { username: username, eventid: eventid, title });
  }
});

router.get('/profiel', fetchUser, async (req, res, next) => {
  const admin = req.response?.data?.admin;

  if (req.response.statusCode != 200 || !admin) {
    res.redirect('/login');
    return;
  }

  res.render('./profiel', { info: req.response.data });
});

router.get('/register', fetchUser, (req, res, next) => {
  res.render('register', { title: "Registeer Account" });
});

router.get('/login', fetchUser, (req, res, next) => {

  const sessionId = req.cookies.Token;
  const user = Users.get(sessionId);
  if (user) res.redirect('/');
  const code = req.query.code || "";

  res.render('login', { title: "Login", id: "admin", image: "/images/Placeholder.png", code });
});

router.get('/login/:id', fetchUser, fetchEvent, (req, res, next) => {
  const sessionId = req.cookies.Token;
  const user = Users.get(sessionId);
  if (user) res.redirect('/');

  let title = "Login";
  let image = "/images/Placeholder.png";
  if (req.response.statusCode == 200) title = req.response.data.title;
  if (req.response.data) image = req.response.data.image
  const code = req.query.code || "";

  res.render('login', { title, id: req.params.id, image, code });
});

router.get('/upload', fetchUser, async (req, res) => {
  const username = req.response?.data?.username;
  const admin = req.response?.data?.admin;
  const eventid = req.response?.data?.eventid?.trim();

  let title = "Upload";
  if (req.response.statusCode != 200) res.redirect('/login');
  if (admin) res.render('./upload/event');

  else {
    const event = await Event.findById(eventid)
    title = event?.title;
    res.render('./upload/foto', { username: username, eventid: eventid, title });
  }

});

router.get('/status', async (req, res, next) => {
  res.status(200).json({ statusCode: 200, statusMessage: "OK", message: "Succes" });
});



module.exports = router;
