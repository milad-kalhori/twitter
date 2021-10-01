const Joi = require('joi');

function tweetValidate(tweet) {
    const schema = {
        image : Joi.string(),
        text : Joi.string().required(),
    };
    return Joi.validate(tweet , schema);
}
module.exports = {
    tweetValidate,
};