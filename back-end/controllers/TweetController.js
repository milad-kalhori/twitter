const {tweetValidate} = require("../validator/tweetValidator");
const _ = require("lodash");
const mongoose = require('mongoose')
const moment = require('jalali-moment');
const config = require("config")

module.exports = new class TweetController {
  async getAllTweets(req, res) {
    const Tweet = require("../models/Tweet");
    if (req.body.user) {
      const tweets = await Tweet.find({user: new mongoose.Types.ObjectId(req.body.user)}).populate("user").sort({'date': -1}).limit(20);
      return res.send(tweets);
    } else if (req.body.hashTag) {
      const tweets = await Tweet.find({hashTags: {$elemMatch: {$in: ["sword", req.body.hashTag]}}}).populate("user").sort({'date': -1}).limit(20);
      res.send(tweets);
    } else {
      const tweets = await Tweet.find().sort({'date': -1}).populate("user").limit(20);
      res.send(tweets);
    }
  }

  async newTweet(req, res) {
    const {error} = tweetValidate(req.body);
    if (error) return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
    const hashTags = req.body.text.includes("#") ? req.body.text.match(/#\S+/g).map(item => item.replace("#", "")) : [];
    const Tweet = require("../models/Tweet");
    const HashTag = require("../models/HashTags");
    const tweet = new Tweet({
      text: req.body.text,
      user: req.user._id,
      image: req.body.image,
      hashTags,
      date: moment(new Date()).locale('fa').format('YYYY-MM-DDTHH:mm:ss')
    });
    if (req.file) {
      let filePath = req.file.path.slice(7);
      const imagePath = `${config.get('DOMAIN')}/` + filePath.replace(/\\/g, '/');
      // const imagePath = `${config.get('DOMAIN')}:${config.get('PORT')}/` + filePath.replace(/\\/g, '/');
      tweet.image = imagePath;
    }
    for (const item of hashTags) {
      const hashTag = await HashTag.findOne({text: item.toLowerCase()});
      if (!hashTag) {
        await new HashTag({text: item.toLowerCase()}).save();
      } else {
        hashTag.count += 1;
        await hashTag.save();
      }
    }
    await tweet.save();
    res.status(200).send(_.pick(tweet, ['text', "_id", 'image', 'hashTags', 'likes', 'date']));
  }

  async likeTweet(req, res) {
    const tweetId = req.params.tweetId;
    const ObjectId = require('mongoose').Types.ObjectId;
    if (!ObjectId.isValid(tweetId)) return res.status(400).json({
      success: false,
      message: "توییت مورد نظر پیدا نشد"
    });
    const Tweet = require("../models/Tweet");
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) return res.status(404).json({
      success: false,
      message: "توییت مورد نظر پیدا نشد"
    });
    tweet.likes++;
    await tweet.save();
    res.status(200).json(_.pick(tweet, ['text', "_id", 'user', 'image', 'hashTags', 'likes']));
  }

  async getAllUser(req, res) {
    const User = require("../models/User");
    const tweets = await User.find().sort({'date': -1}).limit(20);
    return res.send(tweets);
  }
  async getAllHashTags(req, res) {
    const HashTag = require("../models/HashTags");
    const tweets = await HashTag.find().sort({'count': -1}).limit(20);
    return res.send(tweets);
  }
};