require('../../db_functions')
let Users = require('../../models/Users')
let Team = require('../../models/Teams')
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


const teamUtil = {
    //***********COURT APP APIS********************/
    addTeamPlayer: async (data) => {
        let { user_id , player_id} = data;
        let team_exist = await getSingleData(Team, {added_by:ObjectId(user_id),player_id:ObjectId(player_id), status:1},'');
        if(team_exist.status){
            return helpers.showResponse(true, Messages.PLAYER_ALREADY_ADDED, team_exist.data, null, 200);
        }
        let player_data = await getSingleData(Users,{_id:ObjectId(player_id)},'');
        if(!player_data.status){
            return helpers.showResponse(false, Messages.PLAYER_DOESNOT_EXIST, null, null, 200);
        }
        let user_data   = await getSingleData(Users,{_id:ObjectId(user_id)},'');
        if(!user_data.status){
            return helpers.showResponse(false, Messages.USERS_DOESNOT_EXIST, null, null, 200);
        }

        let newObj = {
            added_by:user_id,
            player_id,
        };

        let teamRef = new Team(newObj)
        let result = await postData(teamRef);
        if (result.status) {
            //send notification to player that you are added in team 
            let player_fcm = [player_data.data.fcm_token];
            let payload = {
                title:"Added in Team",
                body:`${user_data.data.full_name} added you in a team.`,
                data:{type:"added_in_team"},
            }
            if(player_fcm.length>0){
                let send_notification = await helpers.sendFcmNotification(player_fcm, payload )     
            }

         //save notification in db 
          let notify_data ={
            send_to:player_id,
            type:"added_in_team",
            title:payload.title,
            body:payload.body,
          }

         let save = new Notification(notify_data) 
         let res = await postData(save);
         if(res.status){
            return helpers.showResponse(true, Messages.PLAYER_ADDED_SUCCESS, null, null, 200);  
         }
         return helpers.showResponse(true, Messages.PLAYER_ADDED_SUCCESS, null, null, 200); 
        } 
         return helpers.showResponse(false, Messages.PLAYER_ADDED_FAILURE, null, null, 200);
    },
    
    getMyTeamPlayer: async (data) => {
        let {user_id} = data;
        let queryObject = { added_by: ObjectId(user_id), status:1};
        // let populate = [{path:"player_id", select:"_id full_name profile_pic fcm_token"},{path:"court_id", select:"_id name"}]
        // let result = await getDataArray(Team,queryObject,'',null,null,populate)

        let result = await Team.aggregate([
            {$match:queryObject},
            {$lookup:{
                from:"courts",
                localField:"player_id",
                foreignField:"checked_in_users.user_id",
                as:"is_checked_in"
            }}
        ])
        await Team.populate(result, [{path: "player_id",select:"_id full_name fcm_token profile_pic"}]);
        if (result) {
            return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result, null, 200);
        }
        return helpers.showResponse(false, Messages.DATA_FOUND_FAILURE, null, null, 200);
    },
    
    getPlayerDetail: async (data) => {
        let {user_id, player_id} = data;
        let queryObject = { _id: ObjectId(player_id), status:1};
        let result = await Users.aggregate([
            {$match:queryObject},
            {$lookup:{
                from:"courts",
                localField:"_id",
                foreignField:"checked_in_users.user_id",
                as:"is_checked_in"
            }},
            {$lookup:{
                from:"user_gallery",
                localField:"_id",
                foreignField:"user_id",
                as:"user_gallery"
            }},
            {$lookup:{
                from:"spotlight",
                localField:"_id",
                foreignField:"player_id",
                as:"spotlight_data",
                pipeline: [{$match: {status:1}}]
            }}
        ])
        // let populate = 
        await Users.populate(result,[{
            path:"preferred_position",
            select:''
        },{
            path:"preferred_game_play",
            select:''
        },{
            path:"preferred_league",
            select:''
        },{
            path:"key_skills",
            select:''
        },{
            path:"intensity_level",
            select:''
        },
    ]);
     console.log("result", result);
        if (result.length>0) {
            return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result[0], null, 200);
        }
        return helpers.showResponse(false, Messages.DATA_FOUND_FAILURE, null, null, 200);
    },

    deleteTeamPlayer: async (data) => {
        let {user_id, player_id} = data;
        let queryObject = {user_id:ObjectId(user_id),player_id:ObjectId(player_id)}
        let result = await updateByQuery(Team,{status:2},queryObject);
         console.log("result", result);
        if(result.status){
            return helpers.showResponse(true, Messages.PLAYER_REMOVED_SUCCESS, null, null, 200);
        }
        return helpers.showResponse(false, Messages.PLAYER_REMOVED_FAILURE, null, null, 200);
    },

}
module.exports = { ...teamUtil }