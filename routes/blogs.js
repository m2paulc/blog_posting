const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Blog = mongoose.model('blogs');
const User = mongoose.model('users');
const {ensureAuthenticated, ensureGuest} = require("../helpers/auth");

router.get('/', (req, res) => {
    Blog.find({status: 'public'})
        .populate('user')
        .sort({date: 'desc'})
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
    .populate('comments.commentUser')
    .then(blog => {
        res.render('blogs/show', {blog: blog});
    });
});

//add a blog
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

//edit a blog
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Blog.findOne({
        _id: req.params.id
    })
    .then(blog => {
        (blog.user != req.user.id) ? res.redirect('/blogs') : res.render('blogs/edit', {blog: blog});
    });
});

//save edited blog PUT Route
router.put('/:id', (req, res) => {
    Blog.findOne({
        _id: req.params.id
    })
    .then(blog => {
        let allowComments;
        (req.body.allowComments ? allowComments = true : allowComments = false);
        
        //new values
        blog.title = req.body.title;
        blog.body = req.body.body;
        blog.status = req.body.status;
        blog.allowComments = allowComments;
        blog.save()
            .then(blog => {
               res.redirect('/dashboard'); 
            });
    });
});

//delete a blog Route
router.delete('/:id', (req, res) => {
    Blog.deleteOne({_id: req.params.id})
        .then(() => {
            res.redirect('/dashboard');
        });
});

//add comment Route
router.post('/comment/:id', (req, res) => {
    Blog.findOne({
        _id: req.params.id
    })
    .then(blog => {
        const newComment = {
            commentBody: req.body.commentBody,
            commentUser: req.user.id
        }
        //add in the beginning (unshift) into an array
        blog.comments.unshift(newComment);
        blog.save()
            .then(blog => {
                res.redirect(`/blogs/show/${blog.id}`);
            });
    });
});

module.exports = router;