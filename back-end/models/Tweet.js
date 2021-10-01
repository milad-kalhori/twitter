const mongoose = require('mongoose');
const moment = require('jalali-moment');


const tweetSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    image: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    hashTags: {type: [{type: String}], default: []},
    likes: {type: Number, default: 0},
    date: {
      type: String,
    },
  },
);

const tweet = mongoose.model('Tweet', tweetSchema);

module.exports = tweet;