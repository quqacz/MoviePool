const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MovieCashSchema = new Schema({
    date: {type: String, required: true},
    movies: [{type: Schema.Types.ObjectId, ref: 'Movie', required: true}],
});

module.exports = mongoose.model('MovieCash', MovieCashSchema);