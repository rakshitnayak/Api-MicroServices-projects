const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(cors())
app.use(express.static('public')) 
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
},{collection: 'completed'});

mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: {type:String, required: true},
  count: {type: Number, default: 0},
  log: 
    [
        {description: String,
        duration: Number,
        date: String}
    ],
})
const User = mongoose.model('User', userSchema);


app.post('/api/users', (req, res)=>{
  const newUsername = req.body.username;
  const newUser = new User({username: newUsername});

  User.findOne({username:newUsername}, function(err, data){
    if (err) return (err);
    else if (data != null){
      res.json("Username already taken")
    }
    else {
      newUser.save(function(error,data){
      if (error) return (error);
      res.json({username: data.username, _id: data._id});
      })
    }
  })
})

app.get('/api/users', (req, res)=> {
  User.find({}).sort('username').select('_id username').exec(function(err, data){
    if (err) return (err);
    res.json(data);
  })
})

app.post('/api/users/:_id/exercises', (req, res)=> {
  const userId = req.params._id;
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  const date = () => {
    if (req.body.date===""){
      return new Date().toDateString();
    } else {
      return new Date(req.body.date).toDateString();
    }
  }
  const exerciseToAdd = {description:description, date:date(), duration:duration};
  User.findByIdAndUpdate(userId, {$push:{log:exerciseToAdd}, $inc:{count: 1}},{new:true},function(err,data){
      if (err) return (err);
      res.json({
            username: data.username,
            description: description,
            duration: duration,
            _id: data._id,
            date: date()
  });
    })
})
  
app.get('/api/users/:_id/logs', (req, res)=> {
    const requestId = req.params._id;
    const dateFrom = Date.parse(new Date(req.query.from));
    const dateTo = Date.parse(new Date(req.query.to));
    const limit = parseInt(req.query.limit);
    User.findById(requestId).exec(function(err,data){
      if (err) return (err);
      if (data === null){
        res.json({error:"no userId of this type"})
      }
      else {
        let log = data.log;
        if (dateFrom && dateTo){
        log = log.filter(item => (Date.parse(new Date(item.date))) > dateFrom && (Date.parse(new Date(item.date))) < dateTo);
        }
        if (limit){
        log = log.slice(0, limit);
        }
        const logCount = log.length;
        res.json({_id:data._id, username:data.username, count:logCount, log:log})
      }

    })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})