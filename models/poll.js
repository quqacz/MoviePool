const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PollSchema = new Schema({
    data: {type: Date,  default: Date.now},
    entryCode: {type: String, required: true},
    voters: [{type: Schema.Types.ObjectId, ref: 'User'}],
    movies: [{type: Schema.Types.ObjectId, ref: 'Vote'}],
    winner: {type: Schema.Types.ObjectId, ref: 'Vote'}
});

module.exports = mongoose.model('Poll', PollSchema);