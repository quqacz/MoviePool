const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoteSchema = new Schema({
    movie: {type: Schema.Types.ObjectId, ref: 'Movie', required: true},
    votes: {type: Number, default: 0}
});

module.exports = mongoose.model('Vote', VoteSchema);