var express = require('express');
var router = express.Router();
var user_controller = require('../controllers/userController');

var bcrypt = require('bcryptjs');
const saltRounds = 12;

// The roles are checked in this solution from the session. This means that the user needs to log in again after the role changes.

//GET / users/ redirecting based on users role
router.get('/',(req,res)=>{  
  if(req.session.user.role==0) {res.redirect('/users/list');} 
  else if(req.session.user.role==1){res.redirect('/users/info');}
  else{res.render('error',{message: "No Permission"})}
});

// GET user list
//allowed only if user is an admin 
router.get('/list',(req,res,next)=>{
  if(req.session.user.role==0) 
  {
    next()
  }
  else{res.render('error',{message: "No Permission"})}
}, user_controller.list);
 

//GET user info
//if user is an admin we redirect to user list 
router.get('/info',(req,res,next)=>{
  if(req.session.user.role==1) 
  {
    next()
  }
  else if(req.session.user.role==0)
  {
    res.redirect('/users/list');      
  }
  else{res.render('error',{message: "No Permission"})}}, user_controller.info);


//using POST here rather than PUT since HTML form does nots support PUT method
//changin the info of the targeted user
//checking that either the user is an admin or the old password is correct
router.post('/change', (req,res,next)=>{
  if(req.session.user.role==0) {next()}
  else if (req.session.user.role==1){bcrypt.compare(req.body.password, req.session.user.password, function(err, result) {
        if (result) {next();} 
        else res.render('error',{message: "Old password incorrect"})
        });
  }
  else res.render('error',{message: "No Permission"})
} , user_controller.change);

//DELETE method for deleting an user
router.delete('/', (req,res,next)=>{
  if(req.session.user.role==0||req.session.user.role==1) { next()}
  else{res.render('error',{message: "No Permission"})}}, user_controller.remove);

  
//POST method fro making an user a admin
router.post('/admin', (req,res,next)=>{
  if(req.session.user.role==0) { next()}
  else{res.render('error',{message: "No Permission"})}}, user_controller.admin);
  

module.exports = router;
