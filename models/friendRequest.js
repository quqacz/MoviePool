const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FriendRequest = new Schema({
    from: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    to: {type: Schema.Types.ObjectId, ref: 'User', required: true},
});

module.exports = mongoose.model('FriendRequest', FriendRequest);