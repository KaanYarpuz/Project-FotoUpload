const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

router.get('/', (req, res) => {
    res.render('foto');
});

router.post('/', upload.array('photos', 5), (req, res) => {
    res.send('Files uploaded successfully!');
});

module.exports = router;
