var express = require('express');
var router = express.Router();

const { ActiveUser, authorize } = require('../middleware/index');

router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.get('/users/:id', (req, res, next) => {
  console.log(req.params.id);
  res.send('respond with a resource');

});

router.post('/auth', authorize, (req, res, next) => {

  if (req.sessionId) {
    res.cookie("Token", req.sessionId, { maxAge: 600000 });
  } 
    res.status(req.response.statusCode).json(req.response);
  
});

router.post('/upload', (req, res, next) => {
  res.status(200).json(req.body);
});



module.exports = router;
