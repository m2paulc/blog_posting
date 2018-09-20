require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const app = express();

//Load user model
require("./models/User")

//Load passport config
require("./config/passport")(passport);

// Load Routes
const auth = require("./routes/auth");

// Load keys
const keys = require("./config/keys");

//Map global promises
mongoose.Promise = global.Promise;
//Mongoose connect
mongoose.connect(keys.mongoURI, { useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Index Route Established');
});

//cookie parser middleware
app.use(cookieParser());
//express-session middleware
app.use(session({
    secret: 'dogs can talk',
    resave: false,
    saveUninitialized: false
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//set global variables
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

//Use Routes
app.use('/auth', auth);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
});