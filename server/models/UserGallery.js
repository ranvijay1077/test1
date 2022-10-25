const mongoose = require('mongoose');
const moment = require('moment')
const Schema = mongoose.Schema;

var userGallerySchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    title: {
        type: String,
        default: ''
    },
    media: {
        type: String,
        default: ''
    },
    thumbnail: {
        type: String,
        default: ''
    },
    media_type: {
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
module.exports = mongoose.model('UserGallery', userGallerySchema, 'user_gallery')