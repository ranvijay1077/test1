const mongoose = require('mongoose');
const moment = require('moment')
const Schema = mongoose.Schema;

var spotlightSchema = new Schema({
    player_id: {
        type:Schema.Types.ObjectId,
        ref:'Users'
    },
    users:{
        type:Array,
        ref:'Users'
    },
    is_spotlighted: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        default: 1
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
module.exports = mongoose.model('Spotlight', spotlightSchema, 'spotlight')