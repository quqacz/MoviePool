const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomInviteSchema = new Schema({
    room: {type: Schema.Types.ObjectId, ref: 'Pool', required: true},
    to: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    from: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    accepted: {type: Boolean, default: false}
});

module.exports = mongoose.model('RoomInvite', RoomInviteSchema);