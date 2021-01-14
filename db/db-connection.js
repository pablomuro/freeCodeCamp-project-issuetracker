const mongoose = require("mongoose")
const dotenv = require('dotenv').config()

const connect = async function () {
  try {
    mongoose.set('useFindAndModify', false);
    await mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });
  } catch (error) {
    console.log("could not connect");
  }
  const connection = mongoose.connection;
  mongoose.Promise = global.Promise;
}

exports.connect = connect


