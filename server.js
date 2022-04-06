const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const userSchema = new Schema({
  username: {type: String, unique: true },
});

/*
We do not save every individual exercise on its own in the DB, but save it into Logs
const exerciseSchema = new Schema({
  username: String,
  description: String,
  duration: Number,
  date: String,
  _id: ObjectId,
})
*/

const subLogSchema = new Schema({
  description: String,
  duration: Number,
  date: String,
}, { _id: false})

const logSchema = new Schema({
  username: {type: String, unique: true },
  count: Number,
  _id: ObjectId,
  log: [subLogSchema]
})

const User = mongoose.model("USer",userSchema);

//const Exercise = mongoose.model("Exercise", exerciseSchema);

const Log = mongoose.model("Log", logSchema);

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// 624c56c9ac44e086e9170215 - pfelto
// 624c5fb66cddacae9fd6f84d - paul
//POST api/users/:_id/exercises
app.post('/api/users/:_id/exercises',(req,res)=>{
  let userId = req.body[':_id'];
  let description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;
  let username;
  
  if(!date){
    date = new Date();
    date = date.toDateString();
  }else{
    //this will use utc time with yyyy-mm-dd
    date = new Date(date);
    date.setDate(date.getDate() + 1);
    //this will return local time which is behind UTC time where i live to 2022-04-03 0000000 UTC is actually 2022-04-02 my time
    date = date.toDateString();
  }

  User.findById(userId,(err,user)=>{
    if(err) {
      res.send('You tried Creating an Exercise for a User that does not exist!');
      return;
    }
    if(user){
    username = user.username;
    let exerciseObj = {
      description,
      duration,
      date
    }
    //console.log(exerciseObj);
    //Need to check if a log record now exists for the user and if it does increase count and add exercise object to it 
    Log.findById(userId,(err,log)=>{
      if(err)  {  
        res.send('There was an unexpected error');
        return;
      }
      if(log){
        //update the log record
        console.log('log',log);
        log.count = log.count + 1;
        log.log.push(exerciseObj);
        console.log('log',log);
        log.save((err,log)=>{
          if(err)  {  
            res.send('There was an unexpected error');
            return;
          }
          res.json({username, description, duration, date, _id: userId});
        })
      }else{
        //create a new log record for the _id
        let newLog = new Log({username, count: 1, _id: userId, log: [exerciseObj]})
        console.log(newLog);
        newLog.save((err,log)=>{
          if(err)  {  
            res.send('There was an unexpected error');
            return;
          }
          res.json({username, description, duration, date, _id: userId});
        })
      }
    })
  }
  })
})

///GET /api/users/:_id/logs You can add from, to and limit parameters to a GET /api/users/:_id/logs request to retrieve part of the log of any user.
// add optional route params

app.get('/api/users/:_id/logs',(req,res)=>{
  let userId = req.params._id;
  Log.findById(userId,'username count _id log',(err,log)=>{
    if(err){
      res.send('There was an unexpected error');
      return;
    } 
    res.json(log)
  })
})

app.route('/api/users')
.get((req,res)=>{
  User.find({},'username _id',(err,docs)=>{
    if(err){
      res.send('There was an unexpected error');
      return;
    } 
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
            if(err){
              res.send('There was an unexpected error');
              return;
            } 
            res.json({username: data.username, _id: data._id})
          })
        }else{
          res.send('There was an unexpected error');
          return;
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