const User = require('../models/userModel');
const datetime = require('node-datetime');

//info of payment
exports.info = function(req, res) {
  User.findOne({
      name: req.session.user.name
    },
    function(err, found_user) {
      if (err) {
        res.sendStatus(404);
        return console.error(err);
      };
      if(found_user.erapaiva){
        var time = found_user.erapaiva;
        var formTime = datetime.create(time);
        formTime = formTime.format('d.m.Y');
      }
      
      res.render('payment', {
        date: formTime,
        member: ((Date.parse(req.session.user.erapaiva)-Date.parse(new Date()))>0),
        name: req.session.user.name
      });

  });
};

//functin for making a payment
exports.payment = function(req, res) {
  User.findOne({
      name: req.body.target
    },
    function(err, user) {
      if(req.body.member =="true"){
        var date = user.erapaiva;
      }
      else{
        var date = new Date();
      }
      //we simply add month in this case depending on the membership setup this could be alterd
      date.setMonth(date.getMonth()+1);
      console.log(date);
      User.findOneAndUpdate({'name':req.body.target}, 
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
  });
};