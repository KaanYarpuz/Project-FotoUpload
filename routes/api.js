const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const fs = require('fs');
const archiver = require('archiver');

const { useAuth, useUserCheck } = require('../middleware/index');
const { Users, ActiveUsers } = require('../middleware/sessions/index');
const { Event } = require('../middleware/mongo/index')

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
  res.send('respond with a resource');
});

router.post('/auth', useAuth, (req, res, next) => {
  if (req.sessionId) res.cookie("Token", req.sessionId, { httpOnly: true, secure: false, sameSite: true, maxAge: 24 * 60 * 60 * 1000 });
  res.status(req.response.statusCode).json(req.response);

});

router.post('/upload/:id', useUserCheck({ "admin": false }), upload.array('photos', 10), (req, res, next) => {
  if (req.files.length === 0) return res.status(400).json({ message: "No file uploaded" });
  res.status(200).json({ message: "Upload Success" });
});

router.post('/events', useUserCheck({ "admin": true }), EventUpload.single('photo'), async (req, res, next) => {

  const { title, description } = req.body;
  if (!title || !description || !req.file) return res.status(400).json({ message: "Invalid Request" });

  const eventcode = Math.floor(100000 + Math.random() * 900000);
  const image = req.file.path.replace(/\\/g, '/').replace('public', '');

  const event = await Event.create({ title, description, eventcode, image });
  const id = event.id;

  const dir = `./public/uploads/${id}/`;
  if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }) }

  res.status(200).json({ message: "Event Created" });

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
        message: "Logout Success"
      });
    }

    res.status(404).json({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "User not found"
    });
  }
});

router.get('/downloadZip/:id', useAuth, (req, res, next) => {
  const eventId = req.params.id;
  const directoryPath = `./public/uploads/${eventId}/`;

  const archive = archiver('zip', { zlib: { level: 9 }});

  archive.on('error', (err) => {
    res.status(500).json({
      statusCode: 500,
      statusMessage: "Error creating zip file",
      message: "An unexpected condition was encountered which prevented the server from fulfilling the request."
    });
  });

  res.attachment(`${eventId}.zip`);
  archive.pipe(res);

  archive.directory(directoryPath, false);
  archive.finalize().then(() => {
    console.log('Zip file created and sent to client');
  });

});


router.get('/map/:id', (req, res, next) => {
  const sessionId = req.cookies.Token;
  const user = Users.get(sessionId);
  if (!user) return res.status(401).json({ message: "Unauthorized" });


  const page = req.query.page;
  const eventId = req.params.id;
  const directoryPath = `./public/uploads/${eventId}/`

  fs.readdir(directoryPath, (err, files) => {

    if (err) return res.status(404).json({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "Event folder not found"
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
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid page number"
    });

    res.status(200).json({
      statusCode: 200,
      statusMessage: "OK",
      message: "sussess",
      page: page,
      totalpages: fileGroups.length,
      data: fileGroups[page - 1]
    });

  });

  });




module.exports = router;
