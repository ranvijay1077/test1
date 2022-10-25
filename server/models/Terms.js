const mongoose = require('mongoose');
const moment = require('moment')
const Schema = mongoose.Schema;

var termSchema = new Schema({
    about_us: {
        type: String,
        default: ''
    },
    terms: {
        type: String,
        default: ''
    },
    privacy_policy: {
        type: String,
        default: ''
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
module.exports = mongoose.model('Terms', termSchema, 'terms')