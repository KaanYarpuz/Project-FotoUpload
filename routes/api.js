const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const fs = require('fs');
const archiver = require('archiver');

const { useAuth, useUserCheck, useRegister } = require('../middleware/index');
const { Users, ActiveUsers } = require('../middleware/sessions/index');
const { Event, User } = require('../middleware/mongo/index');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const id = req.params.id;
    const dest = path.join('public', 'uploads', id);
    fs.mkdir(dest, { recursive: true }, (err) => {
      if (err) cb(err, null);
      else cb(null, dest);
    });
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const Eventstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join('public', 'uploads', 'icons');
    cb(null, dest)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });
const EventUpload = multer({ storage: Eventstorage });

router.get('/', (req, res, next) => {
  res.send('reageer met een bron');
});

router.post('/auth', useAuth, (req, res, next) => {
  if (req.sessionId) res.cookie("Token", req.sessionId, { httpOnly: true, secure: false, sameSite: true, maxAge: 24 * 60 * 60 * 1000 });
  res.status(req.response.statusCode).json(req.response);

});


router.post('/register', useRegister, (req, res, next) => {
  if (req.sessionId) res.cookie("Token", req.sessionId, { httpOnly: true, secure: false, sameSite: true, maxAge: 24 * 60 * 60 * 1000 });
  res.status(req.response.statusCode).json(req.response);

});

router.delete('/register', async (req, res, next) => {

  const sessionId = req.cookies.Token;
  const user = Users.get(sessionId);
  if (!user) return res.status(401).json({ message: "Niet geautoriseerd" });

  Users.delete(sessionId);
  ActiveUsers.delete(user.username);
  res.clearCookie("Token");

  const events = await Event.find({ CreatedById: user.userid });

  events.forEach(async event => {
    const eventFolderPath = path.join(__dirname, '..', 'public', 'uploads', event.id);
    const eventIconPath = path.join(__dirname, '..', 'public', event.image);

    if (fs.existsSync(eventIconPath)) {
      fs.unlinkSync(eventIconPath);
    }

    if (fs.existsSync(eventFolderPath)) {
      fs.rmdirSync(eventFolderPath, { recursive: true });
    }

    await Event.findByIdAndDelete(event.id);
  });

  await User.findByIdAndDelete(user.userid).catch(() => {
    return res.status(500).json({
      statusCode: 500,
      statusMessage: "Interne serverfout",
      message: "Er is een onverwachte situatie opgetreden waardoor de server niet aan het verzoek kon voldoen."
    });
  });

  res.status(200).json({
    statusCode: 200,
    statusMessage: "OK",
    message: "Gebruiker succesvol verwijderd",
  });
});

router.post('/upload/:id', useUserCheck({ "admin": false }), upload.array('photos', 15), (req, res, next) => {
  if (req.files.length === 0)
    return res.status(400).json({
      statusCode: 400,
      statusMessage: "Fout verzoek",
      message: "Geen bestanden geüpload"
    });

  res.status(200).json({
    statusCode: 200,
    statusMessage: "OK",
    message: "Bestanden succesvol geüpload",
  });
});

router.post('/events', useUserCheck({ "admin": true }), EventUpload.single('photo'), async (req, res, next) => {
  const { title, description } = req.body;
  if (!title || !description || !req.file) return res.status(400).json({
    statusCode: 400,
    statusMessage: "Fout verzoek",
    message: "Titel, beschrijving en foto zijn verplicht"
  });

  const eventcode = Math.floor(100000 + Math.random() * 900000);
  const image = req.file.path.replace(/\\/g, '/').replace('public', '');
  const CreatedById = req.response.data.userid;

  const event = await Event.create({ title, description, eventcode, image, CreatedById });

  res.status(200).json({
    statusCode: 200,
    statusMessage: "OK",
    message: "Evenement succesvol aangemaakt",
    data: event
  });
});

router.get('/logout', (req, res, next) => {
  const sessionId = req.cookies.Token;

  if (sessionId) {
    const user = Users.get(sessionId);
    if (user) {
      ActiveUsers.delete(user.username);
      Users.delete(sessionId);

      res.clearCookie("Token");
      res.status(200).json({
        statusCode: 200,
        statusText: "OK",
        message: "Uitloggen gelukt"
      });
    }

    res.status(404).json({
      statusCode: 404,
      statusMessage: "Niet gevonden",
      message: "Gebruiker niet gevonden"
    });
  }
});

router.get('/downloadZip/:id', useAuth, (req, res, next) => {
  const eventId = req.params.id;
  const directoryPath = `./public/uploads/${eventId}/`;

  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err) => {
    res.status(500).json({
      statusCode: 500,
      statusMessage: "Fout bij het maken van het zip-bestand",
      message: "Er is een onverwachte situatie opgetreden waardoor de server niet aan het verzoek kon voldoen."
    });
  });

  res.attachment(`${eventId}.zip`);
  archive.pipe(res);

  archive.directory(directoryPath, false);
  archive.finalize().then(() => {
    console.log('Zip-bestand gemaakt en naar de client verzonden');
  });

});


router.get('/map/:id', (req, res, next) => {
  const sessionId = req.cookies.Token;
  const user = Users.get(sessionId);
  if (!user) return res.status(401).json({ message: "Niet geautoriseerd" });


  const page = req.query.page;
  const eventId = req.params.id;
  const directoryPath = `./public/uploads/${eventId}/`

  fs.readdir(directoryPath, (err, files) => {

    if (err) return res.status(404).json({
      statusCode: 404,
      statusMessage: "Niet gevonden",
      message: "Evenementmap niet gevonden"
    });

    let fileGroups = [];
    files.reverse();

    for (let i = 0; i < files.length; i += 8) {
      let fileGroup = files.slice(i, i + 8).map(file => {
        return { name: file, path: `${directoryPath.replace("./public", "")}${file}` };
      });
      fileGroups.push(fileGroup);
    }

    if (page < 1 || page > fileGroups.length) return res.status(400).json({
      statusCode: 404,
      statusMessage: "Niet gevonden",
      message: "Pagina niet gevonden"
    });

    res.status(200).json({
      statusCode: 200,
      statusMessage: "OK",
      message: "succes",
      page: page,
      totalpages: fileGroups.length,
      data: fileGroups[page - 1]
    });

  });

});

router.delete('/events/:id', useUserCheck({ "admin": true }), async (req, res, next) => {
  const eventId = req.params.id;

  try {
    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
      return res.status(404).json({ message: "Evenement niet gevonden" });
    }

    const eventFolderPath = path.join(__dirname, '..', 'public', 'uploads', eventId);
    const eventIconPath = path.join(__dirname, '..', 'public', event.image);

    if (fs.existsSync(eventIconPath)) {
      fs.unlinkSync(eventIconPath);
    }

    if (fs.existsSync(eventFolderPath)) {
      fs.rmdirSync(eventFolderPath, { recursive: true });
    }

    res.status(200).json({ message: "Evenement succesvol verwijderd", event });
  } catch (error) {
    console.error('Fout bij het verwijderen van het evenement:', error);
    res.status(500).json({ message: "Interne serverfout" });
  }
});



module.exports = router;
