const express = require('express');
const router = express.Router();

const db = require('../login/db');

router.use(express.static(__dirname + '/static'));

router.get('/profile/:id', (req, res) => {
    res.sendFile(__dirname + '/static/profile/index.html');
});

module.exports = router;