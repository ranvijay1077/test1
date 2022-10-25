const mongoose = require('mongoose');
const moment = require('moment')
const Schema = mongoose.Schema;

var debateSchema = new Schema({
    debate: {
        type: String,
        default: ''
    },
    question_type: {
        type: String,
        default: ''
    },
    answer_options:[{
        answer:{
            type:String,
            default:''
        },
    }],
    debate_media: [{
        media : {
            type:String,
            default:''
         },
        thumbnail : {
            type:String,
            default:''
         },
        type : {
            type:String,
            default:''
         },
     }],
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
module.exports = mongoose.model('Debate', debateSchema, 'debate')