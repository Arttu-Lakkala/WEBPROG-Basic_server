const User = require('./models/userModel');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/WWWProgramming');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const bcrypt = require('bcryptjs');
const saltRounds = 12;




add("admin", "admin@admin.com",  0, new Date("October 1 3000 12:30"));

console.log("added admin");
add("hound", "hound@house.com", 1, new Date("January 31 1980 12:30"));
console.log("added hound");
add("visitor", "visitor@place.com", 1, null);
console.log("added visitor");
add("tester", "tester@test.fi", 1,  new Date("May 20 2019 12:30"));
console.log("added tester");

console.log("data added pleade close with ctrl+c");
  

  
function add(name, email, role, erapaiva){ 
  bcrypt.hash(name, saltRounds, function(err, hash) {

        var newUser = new User({
          name: name,
          email: email,
          password: hash,
          role: role,
          erapaiva: erapaiva
          
        });
        newUser.save(function(err) {
          if (err) {
            res.sendStatus(500);
            return console.error(err);
          }
        });

  });
}