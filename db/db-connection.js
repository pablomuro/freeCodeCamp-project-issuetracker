const mongoose = require("mongoose")
const dotenv = require('dotenv').config()

const connect = async function () {
  try {
    await mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true }, () =>
      console.log("connected"));
  } catch (error) {
    console.log("could not connect");
  }
  const connection = mongoose.connection;
  console.log(connection.readyState)
}

exports.connect = connect


