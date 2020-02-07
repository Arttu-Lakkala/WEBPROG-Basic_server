const express = require('express');
const helmet = require('helmet')
const bodyParser = require('body-parser')
const app = express();
const User = require('./models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const datetime = require('node-datetime');
const filePath = require('path');

const mongoose = require('mongoose');

const {
  check,
  validationResult
} = require('express-validator/check');

//initialising database, bcrypt, helmet and other node moduels
mongoose.connect('mongodb://localhost/WWWProgramming');

const db = mongoose.connection;


const path = "http://localhost:3000/";

db.on('error', console.error.bind(console, 'MongoDB connection error:'));



const api = express.Router()
const saltRounds = 12;
const secret = "blade runner"

app.use(helmet())

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));








//serving the main page when opend
app.get('/', function(req, res) {
  res.status(200);
  res.sendFile(filePath.resolve('public/work.html'));
})


//login api
//compares input data to database using bcrypt hashing for protection
api.post('/login', function(req, res, next) {
  
 if (req.body && req.body.name && req.body.password) {

    var username = req.body.name;
    var password = req.body.password;

    User.findOne({
      'name': username
    }, function(err, user) {
      if (err) return console.error(err);
      if (user) {
        bcrypt.compare(password, user.password, function(err, result) {
          if (result) {
            jwt.sign({ id: user.id, role: user.role }, secret, { algorithm: 'HS256' }, function(err, token) {
             console.log(token);
             res.json({ token: token });
            });
          } else {
            res.sendStatus(401);
          }
        });
      } else {
        res.sendStatus(401);
      }
    })
  } else {
    res.sendStatus(401);
  }


});


//user creation
//placed before login check

api.post('/create',[
  //validation
  check('email')
    .isEmail()
  .withMessage("Enter a valid email address."),
  check('name').isLength({
    min: 5
  }).withMessage("Username must be 5 characters or more"),
  check('password').isLength({
    min: 5
  }).withMessage("Password must be 5 characters or more"),
  function(req, res) {
  var errors = validationResult(req);
    //actual function if validation was succesful
    if (errors.isEmpty()) {
      console.log(req.body);
      console.log('adding user');

      bcrypt.hash(req.body.password, saltRounds, function(err, hash) {

        var newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: hash,
          role: 1
          
        });
        newUser.save(function(err) {
          if (err) {
            res.sendStatus(500);
            return console.error(err);
          }
          else{
          console.log("Inserted 1 document into the collection");
          res.status(201);
          res.set('Location', path + 'api/users/' + newUser._id);
          res.json(newUser);
          }
        });


      });
  } else {
    console.log(req.body);
    res.sendStatus(422);
    console.log(errors.mapped());
  }

}]);



//this will be executed for all calls specified after this
//checks for josn token for login
api.use(function(req, res, next) {

  if (req.headers.authorization) {
    if (req.headers.authorization.startsWith('Bearer ')) {
       var token = req.headers.authorization.slice(7, req.headers.authorization.length);
        jwt.verify(token, secret, function(err, decoded) {
          if(err) res.sendStatus(401);
          else {
            //if we managed to log in succesfully save decoded token for later use
            req.decoded = decoded;
            next();
          }
      });
    } else {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }
});


//Get request either for all user or users own info depending on role in json token
api.get('/info/', function(req, res){
  if(req.decoded.role==0){
    //find and return all users
    User.find(function (err, result) {
      console.log(result);
      if (err){
        res.write("error in query result "+ err);
        res.sendStatus(400);
      }
      else{
        var arr = [];
        for(var found of result){
          arr.push(found);
        }
        
        res.json(arr);
          
      }
    });
  }
  else if(req.decoded.role==1){
    //find and return this particular user
    User.findOne({_id: req.decoded.id}, function (err, result){
      console.log(result);
      if (err){
        res.write("error in query result "+ err);
        res.sendStatus(400);
      }
      else{
        arr = [result];
        res.json(arr);
        }
    });
  }
  else{
    res.sendStatus(403);
  }

});


//changing user data by posting POST request to its id as parameter
//used parameters at the end of the addres rather than as separet prameters
api.post('/users/:id',[
  check('email')
    .isEmail()
  .withMessage("Enter a valid email address."),
  check('name').isLength({
    min: 5
  }).withMessage("Username must be 5 characters or more"),
  check('password').isLength({
    min: 5
  }).withMessage("Password must be 5 characters or more"),
  function(req, res) {
  var errors = validationResult(req);
    if (req.decoded.id == req.params.id || req.decoded.role ==0){
      if (errors.isEmpty()) {
        console.log('adding user');

        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {

          User.findOneAndUpdate({'_id':req.params.id}, 
          {$set: 
            {
              name: req.body.name,
              email: req.body.email,
              password: hash
            }
          }, {
            new: true,
            useFindAndModify: false
            },
          function(err, user){
            
            //checking for error
            if (err) {res.status(500);
              res.render('error', {
                message: "Failed to update"
              });;
            }
            
            //sending response
            res.json(user);
            res.status(200);
            
          });


        });
      } else {
        res.sendStatus(422);
        console.log(errors.mapped());
      }
    }
    else{
      res.sendStatus(403);
    }
}]);


//deleting user by sending a delete commad to its ip
api.delete('/users/:id', function(req, res) {
  if (req.decoded.id == req.params.id || req.decoded.role ==0){
    User.deleteOne({
        _id: req.params.id
      },
        function(err){
        if (err) {
          res.sendStatus(404);
          return console.error(err);
        };
        console.log("DELETED");
        console.log(req.params.id);
        res.sendStatus(202);
    });
  }
  else{
    res.sendStatus(403);
  }
});


//making user an admin by sending a post request to admin/(user id)
//only works if token is that of an admin. This means that if all admins are deleted additional ones must be added manualy
//if user is an admin their erapaiva is imiddietly set to 3000.10.1 this is to simulte permanent membership this wo

api.post('/admin/:id', function(req, res) {
  if (req.decoded.role ==0){
    User.findOneAndUpdate({
      _id: req.params.id
    },
    {$set: 
      {
        role: 0,
        erapaiva: new Date('3000.10.1')
      }
    }, {
      new: true,
      useFindAndModify: false
      },
    function(err , user){
      if (err) {
        res.sendStatus(404);
        return console.error(err);
      };
      console.log("New admin");
      res.sendStatus(200);
  });
  }
  else{
    res.sendStatus(403);
  }
});


//making by sending a post request to payment/user id
//in all versions making a payment is the only factor wich admin cannot alter this is to simulate the payment
//it would be easy to allow admin to simply enter date until wich any given user is a member, but that has not been implemented here
api.post('/payment/:id', function(req, res) {
  if(req.decoded.id==req.params.id){
    User.findOne({
        '_id':req.params.id
      },
      function(err, user) {
        if(user.erapaiva > new Date()){
          var date = user.erapaiva;
        }
        else{
          var date = new Date();
        }
        date.setMonth(date.getMonth()+1);
        console.log(date);
        User.findOneAndUpdate({'_id':req.params.id}, 
        {$set: 
          {
            erapaiva: date
          }
        }, {
          new: true,
          useFindAndModify: false
          },
        function(err, user){
          
          //checking for error
          if (err) {res.status(500);
          }
          else{
          //updating user session
          res.json(user);
          res.status(200);
          }
        });
    });
  }
  else{
    res.sendStatus(403);
  }
  
});

//router for api
app.use('/api', api);

app.listen(3000, () => console.log('Example app listening on port 3000!'))
