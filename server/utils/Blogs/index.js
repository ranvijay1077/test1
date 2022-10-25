require('../../db_functions')
let Blogs = require('../../models/Blogs')
let Spotlight = require('../../models/Spotlight')
let ObjectId = require('mongodb').ObjectId
let Messages = require("./message");
let helpers = require('../../services/helper')
let moment = require('moment');
let teamUtil =  require('../Teams/index')


const BlogUtil = {
    getAllBlogs: async () => {
        let queryObject = {status: { $eq: 1 } };
        let result = await getDataArray(Blogs, queryObject, '', null, {created_at:-1});
        if (result.status) {
            return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.DATA_FOUND_FAILURE, null, null, 200);
    },
    
    addPlayerToSpotlight: async (data) => {
        let {user_id, player_id} = data;
        // check if player already exit
        let exist = await getSingleData(Spotlight,{player_id:ObjectId(player_id), status:1},'');
         console.log("exist", exist)
        if(exist.status){
          //push data in user array
          let push = await Spotlight.findOneAndUpdate({_id:ObjectId(exist.data._id)},{$addToSet:{users:ObjectId(user_id)}});
          if(push){
            let d = await teamUtil.getPlayerDetail(data)
            return helpers.showResponse(true, Messages.REQUEST_SENT_SUCCESS, d.data, null, 200);
          }
          return helpers.showResponse(false, Messages.REQUEST_SENT_FAILURE, null, null, 200);
        }
        let dataObj = {
            player_id,
            users:ObjectId(user_id)
        }
        let dataRef = new Spotlight(dataObj);
        let result = await postData(dataRef); 
        if (result.status) {
            let d = await teamUtil.getPlayerDetail(data)
            return helpers.showResponse(true, Messages.REQUEST_SENT_SUCCESS, d.data, null, 200);
        }
        return helpers.showResponse(false, Messages.REQUEST_SENT_FAILURE, null, null, 200);
    },

    getSpotlightPlayers: async (data) => {
        let {type}= data;
        let populate = [{
            path:"player_id",
            select:"_id profile_pic full_name"
        }]
        let limit = 5;
        if(type && type=="all"){
            limit=null;
        }
        // let exist = await getDataArray(Spotlight,{status:1, is_spotlight:1},'',null,{updated_at:-1},populate);
        let exist = await Spotlight.find({status:1, is_spotlighted:1}).sort({updated_at:-1}).populate(populate).limit(limit);
        if(exist.length>0){
            return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, exist, null, 200);
        }
        return helpers.showResponse(false, Messages.DATA_FOUND_FAILURE, null, null, 200);
    },

    // admin apis
    getBlogList: async () => {
        let result = await getDataArray(Blogs,{status:{$ne:2}},'',null,{created_at:-1})
        if (result.status) {
                return helpers.showResponse(true, Messages.BLOG_CREATED_SUCCESS, result.data, null, 200);
            }
        return helpers.showResponse(true, Messages.BLOG_CREATED_FAILURE, null, null, 200);
    },
    
    addBlog: async (data) => {
        let { admin_id , title, media, description } = data;
        let newObj = {
            media,
            title,
            description,
        };
        let blogRef = new Blogs(newObj)
        let result = await postData(blogRef);
        if (result.status) {
                return helpers.showResponse(true, Messages.BLOG_CREATED_SUCCESS, result.data, null, 200);
            }
        return helpers.showResponse(true, Messages.BLOG_CREATED_FAILURE, null, null, 200);
    },
    getBlogDetail: async (data) => {
        let { blog_id } = data;
        let result = await getSingleData(Blogs,{_id:ObjectId(blog_id)},'')
        if (result.status) {
                return helpers.showResponse(true, Messages.BLOG_FOUNDS_SUCCESS, result.data, null, 200);
            }
        return helpers.showResponse(true, Messages.BLOG_NOT_FOUND, null, null, 200);
    },
    updateBlog: async (data) => {
        let { admin_id , blog_id ,title, media, description } = data;
        let updateObj = {
            updated_at:new Date(),
        };
        if(title){
            updateObj.title = title;
        }
        if(media){
            updateObj.media = media;
        }
        if(description){
            updateObj.description = description;
        }
        
        let result = await updateData(Blogs,updateObj, ObjectId(blog_id))
        if (result.status) {
                return helpers.showResponse(true, Messages.BLOG_UPDTAE_SUCCESS, result.data, null, 200);
            }
        return helpers.showResponse(true, Messages.BLOG_UPDATE_FAILURE, null, null, 200);
    },

    getAllSpotlightPlayers: async (data) => {
        let populate = [{
            path:"player_id",
            select:"_id full_name profile_pic"
        }]
        let exist = await Spotlight.find({status:1,is_spotlighted:{$ne:2}}).sort({updated_at:-1}).populate(populate)
        if(exist.length>0){
            return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, exist, null, 200);
        }
        return helpers.showResponse(false, Messages.DATA_FOUND_FAILURE, null, null, 200);
    },

    updateSpotlightStatus: async (data) => {
        let {_id , is_spotlighted} = data;
        let result = await updateData(Spotlight,{is_spotlighted,updated_at:new Date()},ObjectId(_id))
        if(result.status){
            if(is_spotlighted==1){ 
                return helpers.showResponse(true, Messages.ADDED_TO_SPOTLIGHTED_SUCCESS, result.data, null, 200);
            }else if(is_spotlighted==0){
                return helpers.showResponse(true, Messages.REMOVED_SPOTLIGHTED_SUCCESS, result.data, null, 200);
            }else{
                return helpers.showResponse(true, Messages.DELETE_SPOTLIGHTED_SUCCESS, result.data, null, 200);
            }
        }
        return helpers.showResponse(false, Messages.ADDED_TO_SPOTLIGHTED_FAILURE, null, null, 200);
    },

    updateBlogStatus: async (data) => {
        let {_id , status} = data;
        let result = await updateData(Blogs,{status,updated_at:new Date()},ObjectId(_id))
        if(result.status){
            if(status=='2'){ 
                return helpers.showResponse(true, Messages.BLOG_DELETED_SUCCESS, result.data, null, 200);
            }else if(status=='1'){
                return helpers.showResponse(true, Messages.DEBATE_ENABLED_SUCCESS, result.data, null, 200);
            }
            return helpers.showResponse(true, Messages.DEBATE_DISABLED_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.UNABLETOUPDATE_STATUS, null, null, 200);
    },

}
module.exports = { ...BlogUtil }