const mongoose = require('mongoose');
const moment = require('moment')
const Schema = mongoose.Schema;

var userSchema = new Schema({
    full_name: {
        type: String,
        default: ''
    },
    user_name: {
        type: String,
        default: ''
    },
    nick_name: {
        type: String,
        default: ''
    },
    profile_pic: {
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
    otp: {
        type: String,
        default: ''
    },
    is_email_verified: {
        type: Number,
        default: 0
    },
    fcm_token: {
        type: String,
        default: ''
    },
    login_source: {
        type: String,
        default: ''
    },
    google_token: {
        type: String,
        default: ''
    },
    apple_auth_token: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    lat: {
        type: String,
        default: ''
    },
    long: {
        type: String,
        default: ''
    },
    selected_dropdowns: {
        type: Array,
        ref: 'Dropdown'
    },
    user_extra_ques: [{
        question_id:{
            type: Schema.Types.ObjectId,
            ref: 'ExtraQuestions'
        },
        answer:{
            type: String,
            default: ''
        }
    }],
    fav_nba_team: {
        type: String,
        default: '',
    },
    fav_nba_player: {
        type: String,
        default: '',
    },
    qr_code: {
        type: String,
        default: '',
    },
    is_subscribed: {
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
module.exports = mongoose.model('Users', userSchema, 'users')