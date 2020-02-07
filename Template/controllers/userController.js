const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const saltRounds = 12;

const {
  check,
  validationResult
} = require('express-validator/check');

// Display list of all user data excluding obviously passwords
exports.list = function(req, res) {
  User.find(function(err, found_users) {
    if (err) {
      res.sendStatus(404);
      return console.error(err);
    };

    res.render('users', {
      users: found_users,
    });

  });
};

//display all data of given user
exports.info = function(req, res) {
  User.findOne({
      name: req.session.user.name
    },
    function(err, found_user) {
      if (err) {
        res.sendStatus(404);
        return console.error(err);
      };

      console.log(found_user);
      res.render('self', {
        user: found_user,
      });

  });
};

// creating a user
exports.create = [check('email').isEmail().withMessage("Enter a valid email address."),
  check('user_name').isLength({
    min: 5
  }).withMessage("Username must be 5 characters or more"),
  check('password').isLength({
    min: 5
  }).withMessage("Password must be 5 characters or more"),
  function(req, res, next) {

    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render('validation_error', {
        error: errors.mapped()
      });
    } else {

      var password = req.body.password;

      bcrypt.hash(password, saltRounds, function(err, hash) {

        var newUser = new User({
          name: req.body.user_name,
          email: req.body.email,
          password: hash,
          role: 1
        });

        newUser.save(function(err) {
          if (err) {
            res.sendStatus(400);
            return console.error(err);
          };
          req.session.user = newUser;
          console.log("Inserted 1 document into the collection");
          res.status(201);
          res.redirect('/');
        });

      });

    };
  }
];

//login function
exports.login = function(req, res) {

  console.log('logging in');
  //perhaps it would be smarter to use the email address for logging in some cases
  if (req.body.name && req.body.password) {

    User.findOne({
      name: req.body.name
    }, function(err, user) {
      if (err) {
        res.status(404);
        return console.error(err);
      };
      if (!user) {
        res.status(401);
        res.render('error', {
          message: "Login Failed"
        });
        return;
      };
      bcrypt.compare(req.body.password, user.password, function(err, result) {
        if (result) {
          console.log(user);
          req.session.user = user;
          res.redirect('/');
        } else {
          res.status(401);
          res.render('error', {
            message: "Login Failed"
          });
        }
      });
    });
  } else {
    res.status(401);
    res.render('error', {
      message: "Login Failed"
    });
  }

}
//changing users info
//split into 2 parts depending on if password is changed
exports.change = [check('email').isEmail().withMessage("Enter a valid email address."),
  check('user_name').isLength({
    min: 5
  }).withMessage("Username must be 5 characters or more"),
  function(req, res) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render('validation_error', {
        error: errors.mapped()
      });
    } else {
      //pasword not changed
      if(req.body.new_password.length == 0)
      {
        //finding correct user with target and updating it with new values
        User.findOneAndUpdate({'name':req.body.target}, 
        {$set: 
          {
            name: req.body.user_name,
            email: req.body.email
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
          
          //updating user session
          console.log(user);
          if(req.session.user.role1!=0){
              req.session.user = user;
              res.redirect('/');
          }
        });
      }
      //pasword changed
      else if(req.body.new_password.length <5){
        res.render('error', {
          message: "Password must be atleast 5 characters long"
        });        
      }
      else{
        var password = req.body.new_password;

        bcrypt.hash(password, saltRounds, function(err, hash) {
          //finding correct user with target and updating it with new values
          User.findOneAndUpdate({'name':req.body.target}, 
          {$set: 
            {
              name: req.body.user_name,
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
              });
            }
            
            //updating user session
            console.log(user);
            if(req.session.user.role1!=0){
              req.session.user = user;
              res.redirect('/');
            }
          });
        });
      }
    }
  }
]


//deleting an user
exports.remove = function(req, res) {
  User.deleteOne({
      name: req.body.target
    },
    function(err){
      if (err) {
        res.sendStatus(404);
        return console.error(err);
      };
      console.log("DELETED");
      console.log(req.body.target);
      if (req.session.user.role==1){
        name: req.session.user = null;
      }
      res.sendStatus(202);
  });
};



//making user an admin
exports.admin = function(req, res) {
  User.findOneAndUpdate({
      name: req.body.target
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
    function(err){
      if (err) {
        res.sendStatus(404);
        return console.error(err);
      };
      console.log("New admin");
      console.log(req.body.target);
      res.sendStatus(200);
  });
};














