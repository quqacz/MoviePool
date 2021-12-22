const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PollSchema = new Schema({
    data: {type: Date,  default: Date.now},
    entryCode: {type: String, required: true, unique: true},
    host: {
            user: {type: Schema.Types.ObjectId, ref: 'User'},
            numberOfVotes: {type: Number, default: 0},
            maxNumberOfVotes: {type: Number, default: 5},
            isVoting: {type: Boolean, default: false},
            isDoneVoting: {type: Boolean, default: false},
            isConnected: {type: Boolean, default: false}
        },
    voters: [{
            voter: {type: Schema.Types.ObjectId, ref: 'User'},
            numberOfVotes: {type: Number, default: 0},
            maxNumberOfVotes: {type: Number, default: 5},
            isVoting: {type: Boolean, default: false},
            isDoneVoting: {type: Boolean, default: false},
            isConnected: {type: Boolean, default: false}
        }
    ],
    movies: [{
            movie: {type: Schema.Types.ObjectId, ref: 'Movie'},
            votes: {type: Number, default: 0}
    }],
    winner: {
        movie:{type: Schema.Types.ObjectId, ref: 'Movie', default: undefined},
        votes: {type: Number, default: 0}
    },
    finished: {type: Boolean, default: false},
    voting: {type: Boolean, default: false}
});

module.exports = mongoose.model('Poll', PollSchema);