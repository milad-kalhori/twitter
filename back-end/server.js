const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require('config');
const error = require("./middleware/error");

const app = express();


const setupExpressAndSocket = () => {
  const server = app.listen(config.get("PORT"), () => console.log(`Listening on port ${config.get("PORT")}...`));
};

const setMongoConnection = () => {
  mongoose.connect(config.get('MONGO_URI'), {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
    .then(() => console.log('Mongo connected...'))
    .catch(err => console.log('Could not connect to MongoDB...', err));
};

const setRouters = () => {
  const apiRouter = require('./routes/index');
  app.use(cors());
  app.use(bodyParser());
  app.use('/api', apiRouter);
  app.use(error);
  app.use(express.static('public'));
  // app.use('/*' , (req , res) => {
  //     res.sendFile(path.join(__dirname, '../public', 'index.html'));
  // });
};

setupExpressAndSocket();
setMongoConnection();
setRouters();