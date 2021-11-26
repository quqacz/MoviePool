const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PollSchema = new Schema({
    data: {type: Date,  default: Date.now},
    entryCode: {type: String, required: true, unique: true},
    host: {type: Schema.Types.ObjectId, ref: 'User'},
    voters: [{type: Schema.Types.ObjectId, ref: 'User'}],
    movies: [{type: Schema.Types.ObjectId, ref: 'Vote'}],
    winner: {type: Schema.Types.ObjectId, ref: 'Vote'},
    finished: {type: Boolean, default: false}
});

module.exports = mongoose.model('Poll', PollSchema);