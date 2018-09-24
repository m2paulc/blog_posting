const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.render('blogs/index');
});

router.get('/add', (req, res) => {
    res.render('blogs/add');
});

module.exports = router;