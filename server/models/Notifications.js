const mongoose = require('mongoose');
const moment = require('moment')
const Schema = mongoose.Schema;

var notificationSchema = new Schema({
    send_to: {
        type: Schema.Types.ObjectId,
       ref:"Users"
    },
   
    type: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    },
  
    body: {
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
module.exports = mongoose.model('Notifications', notificationSchema, 'notifications')