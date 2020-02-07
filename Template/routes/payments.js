const express = require('express');
const router = express.Router();
const payment_controller = require('../controllers/paymentController');

router.get('/',(req,res)=>{  
  if(req.session.user.role==0) {res.redirect('/users/list');} 
  else if(req.session.user.role==1){res.redirect('/payments/info');}
  else{res.render('error',{message: "No Permission"})}
});

//getting payment ifo of a given user
router.get('/info',(req,res,next)=>{
  if(req.session.user.role==1) 
  {
    next()
  }
  else if(req.session.user.role==0)
  {
    res.redirect('/users/list');      
  }
else{res.render('error',{message: "No Permission"})}}, payment_controller.info);


//post mehod for paying the monthly fee
router.post('/payment',(req,res,next)=>{
  if(req.session.user.role==1) 
  {
    next()
  }
  //The validity of card check goes here
  //in this case we simply check that it is lager than 0
  if(req.body.card>0) 
  {
    next()
  }
else{res.render('error',{message: "Payment info not accepted"})}}, payment_controller.payment);


module.exports = router;