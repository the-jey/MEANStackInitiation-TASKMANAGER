// This file will handle connection logic to the MongoDB database

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TaskManager', {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
  console.log("Connected to MongoDB successfull !");
}).catch((e) => {
  console.log("Error while attempting to connect to MongoDB");
  console.log(e);
});

module.export = {
  mongoose
};