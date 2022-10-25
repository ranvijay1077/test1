const mongoose = require('mongoose');
const moment = require('moment')
const Schema = mongoose.Schema;

var dropdownCategorySchema = new Schema({
    name: {
        type: String,
        default: ''
    },
    sort_order: {
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
module.exports = mongoose.model('DropdownCategory', dropdownCategorySchema, 'dropdown_category')