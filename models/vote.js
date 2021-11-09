const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoteSchema = new Schema({
    imdbId: {type: String, required: true},
    year: {type: String, required: true},
    poster: {type: String, required: true},
    plot: {type: String, default: ''},
    votes: {type: Number, default: 0}
});

module.exports = mongoose.model('Vote', VoteSchema);