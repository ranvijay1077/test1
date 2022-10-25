const mongoose = require('mongoose');
const moment = require('moment')
const Schema = mongoose.Schema;

var dropdownSchema = new Schema({
    type: {
        type: String,
        default: ''
    },
    name: {
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
module.exports = mongoose.model('Dropdown', dropdownSchema, 'dropdown')