const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PollSchema = new Schema({
    data: {type: Date,  default: Date.now},
    entryCode: {type: String, required: true, unique: true},
    host: {
            user: {type: Schema.Types.ObjectId, ref: 'User'},
            numberOfVotes: {type: Number, default: 0},
            maxNumberOfVotes: {type: Number, default: 5}
        },
    voters: [{
            voter: {type: Schema.Types.ObjectId, ref: 'User'},
            numberOfVotes: {type: Number, default: 0},
            maxNumberOfVotes: {type: Number, default: 5}
        }
    ],
    movies: [{type: Schema.Types.ObjectId, ref: 'Vote'}],
    winner: {type: Schema.Types.ObjectId, ref: 'Vote', default: undefined},
    finished: {type: Boolean, default: false}
});

module.exports = mongoose.model('Poll', PollSchema);