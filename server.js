const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const userSchema = new Schema({
  username: {type: String, unique: true },
});

const User = mongoose.model("USer",userSchema);

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//POST api/users/:_id/exercises

///GET api/users/:_id/logs

app.route('/api/users')
.get((req,res)=>{
  User.find({},'username _id',(err,docs)=>{
    if(err) return console.error(err);
    res.json(docs)
  })
})
.post((req,res)=>{
  let newUsername = req.body.username;
  let newUser = new User({username: newUsername});

  newUser.save((err,newUser)=>{
      if(err) {
        if(err.code === 11000){
          User.findOne({username: req.body.username},(err,data)=>{
            if(err) return console.error(err);
            res.json({username: data.username, _id: data._id})
          })
        }else{
          return console.error(err);
        }
      }
      if(newUser) res.json({username: newUser.username, _id: newUser._id}); 
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


/*

      console.log('4')
      if(err.code !== 11000){
        console.log('3')
        return console.error(err);
      } else{
        console.log('5')
        User.findOne({ username: newUsername }, function (err, user) {
          if(err) return console.error(err);
          console.log('1');
          res.json({username: user.username, _id: user._id});
        });
      }

      if(err.code === 11000){
        User.findOne({username: req.body.username},(err,data)=>{
          if(err) return console.error(err);
          res.json({username: data.username, _id: data._id})
        })
      }else{
*/