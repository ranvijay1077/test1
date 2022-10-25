const mongoose = require('mongoose');
const moment = require('moment')
const Schema = mongoose.Schema;

var blogSchema = new Schema({
    media: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    },
    description: {
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
module.exports = mongoose.model('Blogs', blogSchema, 'blogs')