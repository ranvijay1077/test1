require('../../db_functions')
let Court = require('../../models/Courts')
let Users = require('../../models/Users')
let Notification = require('../../models/Notifications')
let ObjectId = require('mongodb').ObjectId
let Messages = require("./message");
let helpers = require('../../services/helper')
let moment = require('moment')
let moment_timzone = require('moment-timezone')
let jwt = require('jsonwebtoken')
let md5 = require('md5')
let nodemailer = require('nodemailer');
const qr = require('qrcode');

const courtUtil = {
    //***********COURT APP APIS********************/
    createCourt: async (data) => {
        let { user_id , name, media, location_name, lat, long } = data;
        //check if court name exit
        let court_name_exist = await getSingleData(Court, {name , status:1},'');
        if(court_name_exist.status){
            return helpers.showResponse(true, Messages.COURT_NAME_ALREADY_EXIST, court_name_exist.data, null, 200);
        }
        //check if court name exit
        let court_location_exist = await getSingleData(Court, {location_name, status:1},'');
        if(court_location_exist.status){
            return helpers.showResponse(false, Messages.COURT_LOCATION_ALREADY_EXIST, null, null, 200);
        }

        let newObj = {
            user_id,
            media,
            name,
            location_name,
            status:0,
            location:{type:"Point",coordinates:[Number(lat) , Number(long)]}
        };
      
        let courtRef = new Court(newObj)
        let result = await postData(courtRef);
        if (result.status) {
                return helpers.showResponse(true, Messages.COURT_CREATED_SUCCESS, result.data, null, 200);
            }
        return helpers.showResponse(true, Messages.COURT_CREATED_FAILURE, null, null, 200);
    },
    
    getMyCourts: async (data) => {
        let {user_id} = data;
        let queryObject = { user_id: ObjectId(user_id), status: { $ne: 1 } };
        let result = await getDataArray(Court, queryObject, '');
      
        if (result.status) {
            return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.DATA_FOUND_FAILURE, null, null, 200);
    },
    
    deleteMyCourts: async (data) => {
        let {user_id, court_id} = data;

        let result = await updateByQuery(Court, {status:2}, {_id:ObjectId(court_id),user_id:ObjectId(user_id)});
        if (result.status) {
            return helpers.showResponse(true, Messages.COURT_DELETE_SUCCESS, null, null, 200);
        }
        return helpers.showResponse(false, Messages.COURT_DELETE_FAILURE, null, null, 200);
    },

    getNearByCourts: async (data) => {
        let {user_id, lat , long} = data;

        let result = await Court.aggregate([
            {
                "$geoNear": {
                    "query" : {"status":1},
                    "near": {
                        "type": "Point",
                        "coordinates": [Number(lat), Number(long)]
                    },
                    "distanceField": "distance",
                    "spherical": true,
                    "maxDistance": 16093.4
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "checked_in_users.user_id",
                    "foreignField": "_id",
                    "as": "is_checked_in",
                    "pipeline": [{
                        $match: {
                            "_id": ObjectId(user_id)
                        },
                    },
                    {
                        $project: {
                            'name': 1,
                        }
                    }]
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "bookmark_user.user_id",
                    "foreignField": "_id",
                    "as": "is_book_marked",
                    "pipeline": [{
                        $match: {
                            "_id": ObjectId(user_id)
                        },
                    },
                    {
                        $project: {
                            'name': 1,
                        }
                    }]
                }
            },
        ])
        
        await Court.populate(result, {path: "checked_in_users.user_id", select:"_id full_name user_name profile_pic fcm_token"});
        if (result.length>0){
            return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result, null, 200);
        }
        return helpers.showResponse(false, Messages.DATA_FOUND_FAILURE, null, null, 200);
 
    },

    getActiveUsers: async (data) => {
        let {user_id, court_id} = data;

        let result = await Court.aggregate([
          { $match:{_id:ObjectId(court_id)}}
        ])

        await Court.populate(result, {path: "checked_in_users.user_id", select:"_id full_name user_name profile_pic fcm_token"});
        
        if (result){
            return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result, null, 200);
        }
        return helpers.showResponse(false, Messages.DATA_FOUND_FAILURE, null, null, 200);
 
    },

    updateCheckIn: async (data) => {
        let {user_id, court_id , type, checkin_date_time} = data;
        if(type=="check_in"){
            let push_data = await Court.findOneAndUpdate(
                {_id: ObjectId(court_id) },
                {$push:{checked_in_users:{user_id:ObjectId(user_id), checkin_date_time,}}},
                {new: true}
             ).populate({path:"user_id" ,select:""})
            if (push_data) {
                let court_data = await Court.aggregate([
                    {$match:{_id:ObjectId(court_id)}}
                ])
                if(court_data.length>0){
                    if(court_data[0].checked_in_users.length==5){
                        let is_verified = await updateData(Court,{is_verified:1, updated_at:new Date()}, ObjectId(court_id));
                    }
                }
                //send CheckIn notification
                let d = push_data.checked_in_users.filter(x=>x.user_id.toHexString()==user_id)
                let temp = {...push_data._doc, is_checked_in:d.length?[{user_id}]:[]}
                console.log("teamp", temp);
                if(push_data.user_id._id.toHexString()!=user_id){
                    let send_notification = await courtUtil.sendCheckInNotification(push_data,user_id);
                }
               
                return helpers.showResponse(true,Messages.CHECK_IN_SUCCESS, temp, null, 200);
            }
        }
        else if(type=="check_out"){
            let pull_data = await Court.findOneAndUpdate(
                    { _id: ObjectId(court_id) },
                    { $pull:{checked_in_users:{user_id:ObjectId(user_id)}}},
                    {new: true}
            )
            if (pull_data) {
                let d = {...pull_data._doc,is_checked_in:[]}
           
                return helpers.showResponse(true, Messages.CHECK_OUT_SUCCESS, d, null, 200);
            }
        }
        return helpers.showResponse(false, Messages.CHECK_IN_FAILURE, null, null, 200);
    },
  
    sendCheckInNotification:async(push_data,checkin_user_id)=>{
        let fcm_token = [push_data.user_id.fcm_token]
        let user_data = await getSingleData(Users,{_id:ObjectId(checkin_user_id)},'');
        if(!user_data.status){
            return helpers.showResponse(false, Messages.NO_USER_EXIST, null, null, 200);     
        }
        let payload = {
            title:"Player Checked In",
            body:`${user_data.data.full_name} checked in to your court(${push_data.name})`,
            data:{type:"checked_in_notify"},
        }
        if(fcm_token.length>0){
            let send_notification = await helpers.sendFcmNotification(fcm_token, payload )     
        }

         //save notification in db 
          let notify_data ={
            send_to:push_data.user_id._id,
            type:"check_in",
            title:payload.title,
            body:payload.body,
          }

         let save = new Notification(notify_data) 
         let result = await postData(save);
         if(result.status){
            return helpers.showResponse(true, Messages.NOTIFICATION_SAVED_SUCCESS, result.data, null, 200);  
         }
         return helpers.showResponse(true, Messages.NOTIFICATION_SAVED_FAILURE,null , null, 200);  
    },

    addBookmark: async (data) => {
        let {user_id,court_id} = data;
        //check if user already bookmarkted court
        let  exist = await Court.findOne({_id:ObjectId(court_id),"bookmark_user.user_id":ObjectId(user_id)})
         console.log("Exist", exist)
        if(!exist){
            let push_data = await Court.findOneAndUpdate(
                { _id: ObjectId(court_id) },
                { $push:{bookmark_user:{user_id:ObjectId(user_id)}}},
                {new: true})
            if (push_data) {
                return helpers.showResponse(true, Messages.BOOKMARKED_SUCCESS, null, null, 200);
            }
        }
        let pull_data = await Court.findOneAndUpdate(
                    { _id: ObjectId(court_id) },
                    { $pull:{bookmark_user:{user_id:ObjectId(user_id)}}},
                    {new: true}
            )
            if (pull_data) {
                return helpers.showResponse(true, Messages.REMOVED_BOOKMARKED_SUCCESS, null, null, 200);
            }
            return helpers.showResponse(false, Messages.BOOKMARKED_FAILURE, null, null, 200);
    },

    getMyBookMarkes: async (data) => {
        let {user_id, lat , long} = data;

        let result = await Court.aggregate([
            {
                "$geoNear": {
                    "query" : {"status":1,"bookmark_user.user_id":ObjectId(user_id)},
                    "near": {
                        "type": "Point",
                        "coordinates": [Number(lat), Number(long)]
                    },
                    "distanceField": "distance",
                    "spherical": true,
                     "maxDistance": 16093.4
                }
            },
        ])
        console.log("result", result)
        if (result.length>0){
            return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result, null, 200);
        }
        return helpers.showResponse(false, Messages.DATA_FOUND_FAILURE, null, null, 200);
    },

    //===================+++++ADMIN APIS===================
    getAllAdminCourts: async (data) => {
        let result = await getDataArray(Court, {added_by:"admin", status:{$ne:2}},'',null,{created_at:-1})
        if (result.status){
            return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.DATA_FOUND_FAILURE, null, null, 200);
    },
    addAdminCourt: async (data) => {
        let { name, media, location_name, lat, long } = data;
        //check if court name exit
        let court_name_exist = await getSingleData(Court, {name , status:1},'');
        if(court_name_exist.status){
            return helpers.showResponse(true, Messages.COURT_NAME_ALREADY_EXIST, court_name_exist.data, null, 200);
        }
        //check if court name exit
        let court_location_exist = await getSingleData(Court, {location_name, status:1},'');
        if(court_location_exist.status){
            return helpers.showResponse(false, Messages.COURT_LOCATION_ALREADY_EXIST, null, null, 200);
        }
        let newObj = {
            added_by:"admin",
            media,
            name,
            location_name,
            location:{type:"Point",coordinates:[Number(lat) , Number(long)]}
        };
      
        let courtRef = new Court(newObj)
        let result = await postData(courtRef);
        if (result.status) {
                return helpers.showResponse(true, Messages.COURT_CREATED_SUCCESS, result.data, null, 200);
            }
        return helpers.showResponse(true, Messages.COURT_CREATED_FAILURE, null, null, 200);
    },
    updateAdminCourt: async (data) => {
        let { court_id, name, media, location_name, lat, long } = data;
        let updateObj = {
            name,
            location_name,
            location:{type:"Point",coordinates:[Number(lat) , Number(long)]},
            updated_at:new Date(),
        }
        if(media){
            updateObj.media = media;
        }
        let result = await updateData(Court,updateObj,ObjectId(court_id))
        if (result.status) {
                return helpers.showResponse(true, Messages.UPDATED_SUCCESS, result.data, null, 200);
            }
        return helpers.showResponse(true, Messages.UPDATED_FAILURE, null, null, 200);
    },
    updateAdminCourtStatus: async (data) => {
        let { court_id, status } = data;
        let result = await updateData(Court,{status, updated_at:new Date()},ObjectId(court_id))
        if (result.status) {
                return helpers.showResponse(true, Messages.UPDATED_SUCCESS, result.data, null, 200);
            }
        return helpers.showResponse(true, Messages.UPDATED_FAILURE, null, null, 200);
    },
    getAdminCourtDetail: async (data) => {
        let { court_id } = data;
        let result = await getSingleData(Court,{_id:ObjectId(court_id)},'')
        if (result.status) {
                return helpers.showResponse(true, Messages.UPDATED_SUCCESS, result.data, null, 200);
            }
        return helpers.showResponse(true, Messages.UPDATED_FAILURE, null, null, 200);
    },
    getAllUserCourts: async (data) => {
        let populate = [{path:"user_id"}]
        let result = await getDataArray(Court, {added_by:{$ne:"admin"}, status:{$ne:2}},'',null,{created_at:-1},populate)
        if (result.status){
            return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.DATA_FOUND_FAILURE, null, null, 200);
    },
}
module.exports = { ...courtUtil }