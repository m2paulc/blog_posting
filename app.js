require("dotenv").config();
const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const app = express();

//Load models
require("./models/User");
require("./models/Blog");

//Load passport config
require("./config/passport")(passport);

// Load Routes
const index = require("./routes/index");
const auth = require("./routes/auth");
const blogs = require("./routes/blogs");

// Load keys
const keys = require("./config/keys");

//handlebars helper
const {
    truncate,
    stripTags
} = require("./helpers/hbs");

//Map global promises
mongoose.Promise = global.Promise;
//Mongoose connect
mongoose.connect(keys.mongoURI, { useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));
    
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//handlebars middleware
app.engine('handlebars', exphbs({
    helpers: {
        truncate: truncate,
        stripTags: stripTags
    },
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

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

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Use Routes
app.use('/', index);
app.use('/auth', auth);
app.use('/blogs', blogs);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
});