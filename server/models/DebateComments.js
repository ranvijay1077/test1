const mongoose = require('mongoose');
const moment = require('moment')
const Schema = mongoose.Schema;

var debateCommentSchema = new Schema({
    user_id: {
        type:Schema.Types.ObjectId,
        ref:'Users'
    },
    debate_id: {
        type:Schema.Types.ObjectId,
        ref:'Debate'
    },
    comment: {
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
module.exports = mongoose.model('DebateComments', debateCommentSchema, 'debate_comments')