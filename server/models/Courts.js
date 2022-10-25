const mongoose = require('mongoose');
const moment = require('moment')
const Schema = mongoose.Schema;

var courtSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    added_by: {
        type: String,
        default: 'user'
    },
    name: {
        type: String,
        default: ''
    },
    media: {
        type: String,
        default: ''
    },
    location_name: {
        type: String,
        default: ''
    },
    location: {
        type: {type:String},
        coordinates:[]
    },
    checked_in_users:[{
        checked_in_date_time:{
            type:Date,
            default:Date.now
        },
        user_id:{
            type:Schema.Types.ObjectId,
            ref:'Users'
        },
    }],
    bookmark_user:[{
        user_id:{
            type:Schema.Types.ObjectId,
            ref:'Users'
        },
    }],
    is_verified: {
        type: Number,
        default: 0,
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

//create indexing

module.exports = mongoose.model('Courts', courtSchema, 'courts')