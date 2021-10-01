const mongoose = require('mongoose');
const config = require('config');
const jwt = require('jsonwebtoken');
const moment = require('jalali-moment');
const userSchema = new mongoose.Schema(
  {
    name: String,
    username: {type: String, unique: true},
    image: String,
    password: String,
    date: {
      type: String,
      default: moment().locale('fa').format('YYYY-MM-DDTHH:mm:ss')
    },
  }
);

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({
    _id: this._id,
  } , config.get('jwtPrivateKey'));
  return token;
};
const user = mongoose.model('User', userSchema);


module.exports = user;