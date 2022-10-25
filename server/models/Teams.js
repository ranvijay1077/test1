const mongoose = require('mongoose');
const moment = require('moment')
const Schema = mongoose.Schema;

var teamSchema = new Schema({
    added_by: {
        type: Schema.Types.ObjectId,
       ref:"Users"
    }, 
    player_id: {
        type: Schema.Types.ObjectId,
        ref:"Users"
    },
    status: {
        type: Number,
        default: 1,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default:Date.now,
    }
});
module.exports = mongoose.model('Teams', teamSchema, 'teams')