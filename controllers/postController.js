var mongoose = require('mongoose');
var config = require('../config'); // get our config file
var Post = require('../models/posts'); // get our mongoose model

exports.getPosts = function(req, res) {
    Post.find((err, posts) => {
        if (err) throw err;
        res.json(posts);
    });
};

exports.getPostByID = function(pid, callback) {
    Post.find({ id: pid }, callback)
};
exports.getPostsByUID = function(uid, req, res) {
    // var uid = req.params.id;
    Post.find({ userId: uid }, (err, posts) => {
        if (err) throw err;
        res.json(posts);
    });
};