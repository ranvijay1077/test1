const mongoose = require('mongoose');
const moment = require('moment')
const Schema = mongoose.Schema;

var questionSchema = new Schema({
    question: {
        type: String,
        default: ''
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
module.exports = mongoose.model('ExtraQuestions', questionSchema, 'extra_questions')