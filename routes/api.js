const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const { useUser, useAuth } = require('../middleware/index');
const { Users, ActiveUsers } = require('../middleware/sessions/index');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage: storage });

router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});


router.post('/auth', useAuth, (req, res, next) => {
  if (req.sessionId) res.cookie("Token", req.sessionId, { httpOnly: true, secure: false, sameSite: true, maxAge: 24 * 60 * 60 * 1000 });
  res.status(req.response.statusCode).json(req.response);
  
});

router.get('/user', useUser, (req, res, next) => {
  res.status(req.response.statusCode).json(req.response);
});

router.post('/upload', upload.array('photos', 5), (req, res, next) => {
  res.status(200).json({ message: "Upload Success" });
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
      statusText: "Not Found",
      message: "Logout Failed"
    });
  }
});


module.exports = router;
