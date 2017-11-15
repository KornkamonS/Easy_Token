var mongoose = require('mongoose');
var config = require('../config'); // get our config file
var User = require('../models/users'); // get our mongoose model
var hash = require('../hash');
var jwt = require('jsonwebtoken');
exports.getUsers = function(req, res) {
    User.find((err, users) => {
        if (err) throw err;
        res.json(users);
    });

};

exports.getUserByID = function(uid, callback) {

    User.find({ id: uid }, callback);
};

exports.getOID = function(req, res) {
    User.find((err, users) => {
        if (err) throw err;
        res.json(users);
    });
};
exports.loginByAPI = function(req, res) {
    User.findOne({ email: req.body.email }, function(err, user) {
        if (err) throw err;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Authentication failed. User not found.'
            });
        } else if (user) {
            var passwdData = hash.sha512(req.body.password, user.salt);
            if (user.passwdhash != passwdData.passwordHash) {
                return res.json({
                    success: false,
                    message: 'Authentication failed. Wrong password.'
                });
            } else {
                const payload = {
                    id: user.id,
                    email: user.email,
                    admin: user.admin
                };
                var token = jwt.sign(payload, config.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                // res.cookie('auth', token);
                return res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }
        } // end of else if(user)
    }); // end of the callback function
}

exports.signupByAPI = function(req, res) {
    var salt = hash.genRandomString(16);
    var pwd_data = hash.sha512(req.body.password, salt);
    // find a user with maximum id: find all users and sort by id max-to-min
    User.find({}).sort({ id: -1 }).limit(1).exec((err, users) => {
        if (err) throw err;
        if (users && users.length != 0) {
            var newUser = new User({
                id: users[0].id + 1, // users is an array of User objects
                name: req.body.name,
                age: parseInt(req.body.age),
                email: req.body.email,
                salt: pwd_data.salt,
                passwdhash: pwd_data.passwordHash,
                admin: req.body.admin ? req.body.admin : false
            });
            newUser.save(function(err, user) {
                if (err) {
                    return res.json({
                        success: false,
                        message: 'Unable to add new user!',
                    });
                } else {
                    return res.json({
                        success: true,
                        message: 'New user has been created',
                        user: {
                            name: newUser.name,
                            email: newUser.email,
                            admin: newUser.admin
                        }
                    });
                }
            });
        } else {
            res.json({
                success: false,
                message: 'User cannot be added!'
            });
        }
    });
};

exports.insertByAPI = function(req, res, userDetail) {
    User.find({}).sort({ id: -1 }).limit(1).exec((err, users) => {
        if (err) throw err;
        if (users && users.length != 0) {
            var newUser = new User({
                id: users[0].id + 1, // users is an array of User objects
                name: userDetail.name,
                age: userDetail.age,
                email: userDetail.email,
            });
            newUser.save(function(err) {
                if (err) {
                    return res.json({
                        success: false,
                        message: 'Unable to add new user!',
                    });
                } else {
                    return res.json({
                        success: true,
                        message: 'Add successful.'
                    })
                }
            });
        } else {
            return res.json({
                success: false,
                message: 'User cannot be added!'
            });
        }
    });
}
exports.insertOnWeb = function(req, res, userDetail) {
    User.find({}).sort({ id: -1 }).limit(1).exec((err, users) => {
        if (err) throw err;
        if (users && users.length != 0) {
            var newUser = new User({
                id: users[0].id + 1, // users is an array of User objects
                name: userDetail.name,
                age: userDetail.age,
                email: userDetail.email,
            });
            newUser.save();
        }
    });
}
exports.deleteByAPI = function(req, res, uid) {
    User.remove({ id: uid }, (err, users) => {
        if (err) return res.json({
            success: false,
            message: 'Unable to deleted user!',
        });

        return res.json({
            success: true,
            message: 'user has been deleted',
        });
    });
}
exports.putByAPI = function(req, res, uid) {
    User.find({ id: uid }, (err, users) => {
        if (err) return res.json({
            success: false,
            message: 'Unable to edit user!',
        });
        users[0].name = req.body.name ? req.body.name : users[0].name;
        users[0].age = req.body.age ? req.body.age : users[0].age;
        users[0].email = req.body.email ? req.body.email : users[0].email;

        users[0].save(function(err) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Unable to save user!'
                })
            }
            return res.json({
                success: true,
                message: 'user has been edit',
            });
        })
    });
}