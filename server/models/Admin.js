const mongoose = require('mongoose');
const moment = require('moment')
const Schema = mongoose.Schema;

var adminSchema = new Schema({
    name: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    profile_pic: {
        type: String,
        default: ''
    },
    status: {
        type: Number,
        default: 1
    },
    created_at: {
        type: Number,
        default: moment().unix()
    },
    updated_at: {
        type: Number,
        default: moment().unix()
    }
});
module.exports = mongoose.model('Admin', adminSchema, 'admin')