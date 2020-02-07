const express = require('express');
const hbs = require('express-hbs');
const helmet = require('helmet')
const bodyParser = require('body-parser')
const users = require('./routes/users');
const payment = require('./routes/payments');
const userController = require('./controllers/userController');
const session = require('express-session');
const app = express();


//setting up needed exstensions
app.use(helmet());
app.use(bodyParser.urlencoded({
  extended: false
}))

//connection to database
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/WWWProgramming');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


//session and template engine
app.use(session({
  secret: 'Bladerunner',
  resave: false,
  saveUninitialized: false
}));


//Enabeling DELETE and PUT methods
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Methods", "GET, PUT, DELETE");
    next()

});

app.engine('hbs', hbs.express4());
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');



//these are the only 2 request that do not requier login

//logging in
app.post('/login', userController.login	);

//creating a new standard user
app.post('/users/create', userController.create);


//checking for login
app.use(function(req, res, next) {

  if (!req.session.user) {
    res.render('login');
  } else {
    next()
  }

});




//basic main page render
app.get('/', function(req, res) {
    res.render('main', {
      date: ((Date.parse(req.session.user.erapaiva)-Date.parse(new Date()))>0),
      role: req.session.user.role
    });
});

//router for users
app.use('/users/', users);

//router for payments
app.use('/payments/', payment);

//logging out
app.get('/logout', function(req, res) {
  req.session.user = null;
  res.redirect('/');
});

app.listen(3000, () => console.log('App listening on port 3000!'))