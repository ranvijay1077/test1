const mongoose = require('mongoose');
const moment = require('moment')
const Schema = mongoose.Schema;

var dropdownSubcatSchema = new Schema({
    category_id: {
        type:Schema.Types.ObjectId,
        ref:'DropdownCategory'
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
module.exports = mongoose.model('DropdownSubCategory', dropdownSubcatSchema, 'dropdown_sub_category')