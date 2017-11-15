// =======================
// get the packages we need ============
// =======================
var express = require('express');
var app = express();
var path = require('path')
var bodyParser = require('body-parser');
var morgan = require('morgan');
// var cookieParser = require('cookie-parser')
// app.use(cookieParser())
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config.js'); // get our config file
var User = require('./models/users'); // get our mongoose model
var Users = require('./controllers/userController.js');
var Posts = require('./controllers/postController.js');
var hash = require('./hash');
// =======================
// configuration =========
// =======================
var port = process.env.PORT || config.port; // used to create, sign, and verify tokens
var hostname = config.hostname
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

/* setup view engine */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// =======================
// routes ================
// =======================
// basic route
var data = [];
app.get('/', (req, res) => {
    let data = app.get('/user');
    User.find((err, users) => {
        data = users;
        if (err) throw err;
        res.render('index', { // render ‘views/index.ejs’
            title: "Customer List:",
            users: data
        });
    });
});
app.post('/signup', function(req, res) {
    Users.signupByAPI(req, res);
});

app.post('/login', function(req, res) {
    Users.loginByAPI(req, res);
});

// API ROUTES -------------------
// we'll get to these in a second

// =======================
// start the server ======
// =======================


app.listen(port, () => {
    console.log('Magic happens at http://localhost:' + port);
});

app.get('/user', (req, res) => {
    // res.send('/api/users endpoint');
    Users.getUsers(req, res);
});

app.get('/user/:id', (req, res) => {
    var id = req.params.id;
    // res.send('/api/users/' + req.params.id);
    Users.getUserByID(id, function(err, user) {
        if (err) throw err;
        res.json(user);
    })
});

app.use(function(req, res, next) {

    // if token is valid, continue to the specified sensitive route
    // if token is NOT valid, return error message
    // read a token from body or urlencoded or header (key = x-access-token)
    var token = req.body.token || req.query.token || req.headers['x-access-token'] // || req.cookies.auth;

    if (token) {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Invalid token.'
                });
            } else {
                req.decoded = decoded; // add decoded token to request obj.
                next(); // continue to the sensitive route
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

//On web
app.post('/', function(req, res) {

    var newUser = {
        name: req.body.name,
        age: parseInt(req.body.age),
        email: req.body.email
    }

    Users.insertOnWeb(req, res, newUser, (err) => {
        console.log(err);
    });
    id = data[data.length - 1].id + 1;
    newUser.id = id;
    data.push(newUser);
    res.render('index', { // render ‘views/index.ejs’
        title: "Customer List:",
        users: data
    });


});

app.post('/user', function(req, res) {

    var newUser = {
        name: req.body.name,
        age: parseInt(req.body.age),
        email: req.body.email
    }
    Users.insertByAPI(req, res, newUser)


    // data.push(newUser);
    // res.render('index', { // render ‘views/index.ejs’
    //     title: "Customer List:",
    //     users: data
    // });
});


app.delete('/user/:id', function(req, res) {
    if (req.decoded.admin) // check admin authorization
    {
        var uid = req.params.id;
        Users.deleteByAPI(req, res, uid)
    } else {
        res.status(401).json({ // if not an admin user, return
            success: false, // an error message
            message: 'Unauthorized Access'
        });
    }

});
app.put('/user/:id', function(req, res) {
    if (req.decoded.admin) // check admin authorization
    {
        var uid = req.params.id;
        Users.EditByAPI(req, res, uid)
    } else {
        res.status(401).json({ // if not an admin user, return
            success: false, // an error message
            message: 'Unauthorized Access'
        });
    }

});