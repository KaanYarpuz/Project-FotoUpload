const express = require('express');
const router = express.Router();

const { fetchEvent, fetchUser } = require('../middleware/index');

router.get('/', fetchUser, (req, res, next) => {
  if (req.response.statusCode != 200) res.redirect('/login');
  else res.render('index');
});

router.get('/login', (req, res, next) => {
  res.render('login', { title: "Login", id: "admin" });
});

router.get('/login/:id', fetchEvent, (req, res, next) => {

  let title = "Login";
  if(req.response.statusCode == 200) title = req.response.data.title;
  res.render('login', { title, id: req.params.id });
});


router.get('/foto', fetchUser, (req, res) => {
  if (req.response.statusCode != 200) res.redirect('/login');
  else res.render('foto');
});

module.exports = router;
