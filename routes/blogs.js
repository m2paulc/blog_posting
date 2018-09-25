const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Blog = mongoose.model('blogs');
const User = mongoose.model('users');
const {ensureAuthenticated, ensureGuest} = require("../helpers/auth");

router.get('/', (req, res) => {
    Blog.find({status: 'public'})
        .populate('user')
        .then(blogs => {
            res.render('blogs/index', {blogs: blogs});
        });
});

//show single blog
router.get('/show/:id', (req, res) => {
    Blog.findOne({
        _id: req.params.id
    })
    .populate('user')
    .then(blog => {
        res.render('blogs/show', {blog: blog});
    });
});

//add blogs
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('blogs/add');
});

//process add blog
router.post('/', (req, res) => {
    let allowComments;
    
    (req.body.allowComments ? allowComments = true : allowComments = false);
    
    const newBlog = {
        title: req.body.title,
        body: req.body.body,
        status: req.body.status,
        allowComments: allowComments,
        user: req.user.id
    }
    //create blog
    new Blog(newBlog)
        .save()
        .then(blog => {
            res.redirect(`/blogs/show/${blog.id}`);
        });
});

module.exports = router;