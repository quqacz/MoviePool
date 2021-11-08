const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    username: { type: String, reqired: true},
    nickname: { type: String, reqired: true},
    friends: [{type: Schema.Types.ObjectId, ref: 'User'}],
    polls: [[{type: Schema.Types.ObjectId, ref: 'Poll'}]]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);