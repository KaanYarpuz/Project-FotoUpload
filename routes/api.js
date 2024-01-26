const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const { ActiveUser, authorize } = require('../middleware/index');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage: storage });



router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.get('/users/:id', (req, res, next) => {
  console.log(req.params.id);
  res.send('respond with a resource');
});

router.post('/auth', authorize, (req, res, next) => {

  if (req.sessionId) res.cookie("Token", req.sessionId, { maxAge: 600000 });
  res.status(req.response.statusCode).json(req.response);
  
});

router.post('/upload', upload.array('photos', 5), (req, res, next) => {
  res.status(200).json({ message: "Upload Success" });
});




module.exports = router;
