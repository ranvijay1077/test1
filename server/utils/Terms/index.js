require('../../db_functions')
let Terms = require('../../models/Terms')
let DropdownCategory = require('../../models/DropdownCategory')
let DropdownSubCategory = require('../../models/DropdownSubCategory')
let ObjectId = require('mongodb').ObjectId
let Messages = require("./message");
let helpers = require('../../services/helper')
let moment = require('moment')

const termsUtils = {  
    getContent: async () => {
        let queryObject = {status: { $eq: 1 } };
        let result = await getSingleData(Terms, queryObject, '');
        if (result.status) {
            return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.DATA_FOUND_FAILURE, null, null, 200);
    },
    
    updateContent: async (data) => {
        let {_id , type, content} = data;
        let updateObj = {updated_at:new Date()}
        if(type=="terms"){
            updateObj.terms = content;
        }
        else if(type=="privacy_policy"){
            updateObj.privacy_policy = content;
        }
        else if(type=="about_us"){
            updateObj.about_us = content;
        }

        let result = await updateData(Terms,updateObj,ObjectId(_id))
        if(result.status){
            return helpers.showResponse(true, Messages.UPDATE_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.UPDATE_FAILURE, null, null, 200);
    },


    //admin apis

    //main dropdowns
    addDropDown: async (data) => {
        let {category_name,sub_cat_array} = data;
        //check if name already exist
        let exist = await getSingleData(DropdownCategory,{status:1, name:category_name},'')
        if(exist.status){
            return helpers.showResponse(true, Messages.DROPDOEN_ALREADY_EXIST, exist.data, null, 200);
        }
        //get the last sort order of the dropdown
        let sort_order = 1;
        let sort_exist = await DropdownCategory.findOne({status:1}).sort({sort_order:-1})
        console.log("sort_exist", sort_exist);
        if(sort_exist){
            sort_order = Number(sort_exist.sort_order) + 1;
        }
        sub_cat_array = JSON.parse(sub_cat_array);
        let dataObj =  {
           name:category_name,
           sort_order,
        }
        let d = new DropdownCategory(dataObj);
        let result = await postData(d);
        if (result.status) {
            let category_id = result.data._id;
            let dataArray = [];
            for(var i=0 ;i<sub_cat_array.length;i++){
                let data_ = {
                    category_id:ObjectId(category_id),
                    name:sub_cat_array[i].name,
                }
                dataArray.push(data_);
            }

             console.log("===================",dataArray )
            let sub_cat_insert = await DropdownSubCategory.insertMany(dataArray);
             console.log("==>", sub_cat_insert);
            if(sub_cat_insert){
                return helpers.showResponse(true, Messages.DATA_ADDED_SUCCESS, result.data, null, 200);
            } 
            return helpers.showResponse(false, Messages.UNABLE_TO_ADD, null , null, 200);
        }
        return helpers.showResponse(false, Messages.UNABLE_TO_ADD_DROPDOWN_OTPIONS, null, null, 200);
    },
    getDropdownCategory: async () => {
        let queryObject = {status: { $eq: 1 } };
        let result = await getDataArray(DropdownCategory, queryObject, '',null, {created_at:-1});
        if (result.status) {
            return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.DATA_FOUND_FAILURE, null, null, 200);
    },
    updateDropdownStatus: async (data) => {
        let  {category_id, status} = data;
        let update = await updateData(DropdownCategory,{status,updated_at:new Date()}, ObjectId(category_id))
        if(update.status){
            return helpers.showResponse(true, Messages.UPDATE_SUCCESS, update.data, null, 200);
        }
        return helpers.showResponse(false, Messages.UPDATE_FAILURE, null, null, 200);
    },

    //dropdown option 
    getDropdownSubCategory: async (data) => {
        let  {category_id} = data;
        let result = await DropdownCategory.aggregate([
            {$match:{_id:ObjectId(category_id)}},
            {$lookup:{
                from:"dropdown_sub_category",
                localField:"_id",
                foreignField:"category_id",
                as:"sub_cat_data",
                pipeline:[{
                    $match:{"status":1,}
                },
                {$sort: {  'created_at': -1 }}],
                
            }}
        ])
        return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result[0], null, 200);
    },
    updateDropdownSubCategory: async (data) => {
        let  {subcat_id, status} = data;
        let update = await updateData(DropdownSubCategory,{status,updated_at:new Date()}, ObjectId(subcat_id))
        if(update.status){
            return helpers.showResponse(true, Messages.UPDATE_SUCCESS, update.data, null, 200);
        }
        return helpers.showResponse(false, Messages.UPDATE_FAILURE, null, null, 200);
    },
    addDropdownSubcategory: async (data) => {
        let  {category_id, name} = data;
        let data_ = {
            category_id:ObjectId(category_id),
            name
        }
        let dataObj = new DropdownSubCategory(data_);
        let result = await postData(dataObj);
        if(result.status){
            return helpers.showResponse(true, Messages.DATA_ADDED_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.UNABLE_TO_ADD, null, null, 200);
    },
    
}
module.exports = { ...termsUtils }