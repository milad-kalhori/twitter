const express = require('express');
const router = express.Router();
const TweetController = require("../controllers/TweetController")
const UserController = require("../controllers/UserController")
const {uploadImg} = require("../middleware/upload")
const auth = require('../middleware/auth')

router.get('/', (req, res) => {
  res.send("salam")
});
router.post('/login', UserController.login);
router.post('/register', UserController.register);
router.post('/uploadUserPhoto', [auth], uploadImg.single('image'), UserController.uploadUserPhoto);
router.get('/getProfile', [auth], UserController.getProfile);
router.post('/getAllTweet', [auth], TweetController.getAllTweets);
router.get('/getAllUser', [auth], TweetController.getAllUser);
router.post('/newTweet', [auth], uploadImg.single('image'), TweetController.newTweet);
router.get('/getAllHashTags', [auth], TweetController.getAllHashTags);
router.get('/likeTweet/:tweetId', [auth], TweetController.likeTweet);

module.exports = router;