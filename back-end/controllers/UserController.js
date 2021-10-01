const {registerValidate, loginValidate} = require("../validator/authvalidate");
const _ = require("lodash");
const bcrypt = require('bcrypt');
const User = require('../models/User');
const config = require('config');


module.exports = new class UserController {
  async login(req, res) {
    const {error} = loginValidate(req.body);
    if (error) return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
    let user = await User.findOne({username: req.body.username});
    if (!user) return res.status(400).json({
      success: false,
      message: 'نام کاربری و رمز عبور همخوانی ندارند'
    });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({
      success: false,
      message: 'نام کاربری و رمز عبور همخوانی ندارند'
    });
    const token = user.generateAuthToken();
    await res.json({..._.pick(user, ['name', 'username', 'image']), 'x-auth-token': token});
  }

  async register(req, res) {
    const {error} = registerValidate(req.body);
    if (error) return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
    if ((await User.find({username: req.body.username})).length > 0)
      return res.status(400).json({
        success: false,
        message: "کاربری با این نام کاربری وجود دارد"
      });
    let user = new User(_.pick(req.body, ['username', 'name', 'password', 'image']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    await res.json({..._.pick(user, ['name', 'username', 'image']), 'x-auth-token': token});
  }

  async uploadUserPhoto(req, res) {
    if (req.file) {
      console.log(req.file.path);
      let filePath = req.file.path.slice(7);
      const imagePath = `${config.get('DOMAIN')}/` + filePath.replace(/\\/g, '/');
      // const imagePath = `${config.get('DOMAIN')}:${config.get('PORT')}/` + filePath.replace(/\\/g, '/');
      let profile = await User.findById(req.user._id);
      profile.image = imagePath;
      await profile.save();
      res.status(200).send({imagePath});
    } else
      return res.status(500).json({
        message: 'آپلود انجام نشد.',
        success: false
      })
  }

  async getProfile(req, res) {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send({
      message: "اطلاعات کاربری شما یافت نشد"
    });
    console.log(user);
    await res.send({..._.pick(user, ['name', 'username', 'image']), 'x-auth-token': req.headers['x-auth-token']});
  }
};