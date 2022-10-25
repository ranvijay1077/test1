require('../../db_functions')
let Users = require('../../models/Users')
let Debate = require('../../models/Debate')
let DebateVote = require('../../models/DebateVotes')
let DebateComment = require('../../models/DebateComments')
let ObjectId = require('mongodb').ObjectId
let Messages = require("./message");
let helpers = require('../../services/helper')

const debateUtil = {
    getWeeklyDebate: async () => {
        let queryObject = {status: { $eq: 1 } };
  
        let result = await Debate.aggregate([
            {$match:{status:1}},
            {$lookup:{
                from:'debate_votes',
                localField:'_id',
                foreignField:'debate_id',
                as:"all_votes",
                pipeline: [{
                    $match: {
                        "status": 1
                    },
                }],
                
            }},
            {$lookup:{
                from:'debate_comments',
                localField:'_id',
                foreignField:'debate_id',
                as:"all_comments",
                pipeline: [{
                    $match: {
                        "status": 1
                    },
                }],
            }},
        ])
        console.log(result);
        await Users.populate(result, [{path: "all_comments.user_id", select:"_id full_name user_name profile_pic"},
        {path: "all_votes.user_id", select:"_id full_name user_name profile_pic"}]);
        // let result = await getDataArray(Debate, queryObject, '');
        // if (result.status) {
        //     return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result.data, null, 200);
        // }
        return helpers.showResponse(true, Messages.DATA_FOUND_FAILURE, result, null, 200);
    },
    getWeeklyDebateTest: async () => {
        let result = await Debate.aggregate([
            {$match:{status:1}},
            {$lookup:{
                from:'debate_votes',
                localField:'_id',
                foreignField:'debate_id',
                as:"all_votes",
                pipeline: [{ $match: {
                            "status": 1
                        }, 
                    }]
            }},
            {$lookup:{
                from:'debate_votes',
                localField:'_id',
                foreignField:'debate_id',
                as:"vote_percent",
                pipeline: [{ $match: {
                            "status": 1
                        }, 
                    },
                    { $group: {
                            _id: "$answer_id",
                            total: { $count: {} }
                          }
                    }],
            }},
          
            {$lookup:{
                from:'debate_comments',
                localField:'_id',
                foreignField:'debate_id',
                as:"all_comments",
                pipeline: [{
                    $match: {
                        "status": 1
                    },
                }],
            }},

            { $sort : { created_at : -1 } }
        ])
        console.log(result);
        await Users.populate(result, [{path: "all_comments.user_id", select:"_id full_name user_name profile_pic"},{path: "all_votes.user_id", select:"_id full_name user_name profile_pic"}]);
        
        return helpers.showResponse(true, Messages.DATA_FOUND_FAILURE, result, null, 200);
    },
    
    addVote: async (data) => {
        let {user_id, debate_id, answer_id} = data;
        let exist = await getSingleData(DebateVote,{debate_id:ObjectId(debate_id), user_id:ObjectId(user_id), status:1},'');
        if(exist.status){
          return helpers.showResponse(false, Messages.ALREADY_VOTED, null, null, 200);
        }
        let dataObj = {
            debate_id,
            user_id,
            answer_id
        }
        let dataRef = new DebateVote(dataObj);
        let result = await postData(dataRef); 
        if (result.status) {
            return helpers.showResponse(true, Messages.VOTED_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.VOTED_FAILURE, null, null, 200);
    },
    
    addComment: async (data) => {
        let {user_id, debate_id, comment} = data;
        let dataObj = {
            debate_id,
            user_id,
            comment
        }
        let dataRef = new DebateComment(dataObj);
        let result = await postData(dataRef); 
        if (result.status) {
            return helpers.showResponse(true, Messages.COMMENTED_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.COMMENTED_FAILURE, null, null, 200);
    },
    
    deleteComment: async (data) => {
        let {comment_id} = data;
        let result = await updateData(DebateComment,{status:2,updated_at:new Date()},ObjectId(comment_id))
        if (result.status) {
            return helpers.showResponse(true, Messages.COMMENT_DELETE_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.COMMENT_DELETE_FAILURE, null, null, 200);
    },

    // Admin APs
    getDebateList: async () => {
        let result = await getDataArray(Debate,{status:{$ne:2}},'')
        if (result.status) {
                return helpers.showResponse(true, Messages.BLOG_CREATED_SUCCESS, result.data, null, 200);
            }
        return helpers.showResponse(true, Messages.BLOG_CREATED_FAILURE, null, null, 200);
    },
    
    addDebate: async (data) => {
        let { question_type, debate, answer_options , image_data } = data;
        let newObj = {
            question_type,
            debate,
            debate_media:image_data,
        };
        if(question_type=='mcq' && answer_options!=""){
            newObj.answer_options=JSON.parse(answer_options);
        }
      
        let blogRef = new Debate(newObj)
        let result = await postData(blogRef);
        if (result.status) {
                return helpers.showResponse(true, Messages.BLOG_CREATED_SUCCESS, result.data, null, 200);
            }
        return helpers.showResponse(true, Messages.BLOG_CREATED_FAILURE, null, null, 200);
    },

    getDebateList: async () => {
        let result = await Debate.aggregate([
            {$match:{status:{$ne:2}}},
            {$lookup:{
                from:'debate_votes',
                localField:'_id',
                foreignField:'debate_id',
                as:"all_votes",
                pipeline: [{ $match: {
                            "status": 1
                        }, 
                    }]
            }},
            // {$lookup:{
            //     from:'debate_votes',
            //     localField:'_id',
            //     foreignField:'debate_id',
            //     as:"vote_percent",
            //     pipeline: [{ $match: {
            //                 "status": 1
            //             }, 
            //         },
            //         { $group: {
            //                 _id: "$vote",
            //                 total: { $count: {} }
            //               }
            //         }],
            // }},
          
            {$lookup:{
                from:'debate_comments',
                localField:'_id',
                foreignField:'debate_id',
                as:"all_comments",
                pipeline: [{
                    $match: {
                        "status": 1
                    },
                }],
            }},
        ])
      
        await Users.populate(result, [{path: "all_comments.user_id", select:"_id full_name user_name profile_pic"},{path: "all_votes.user_id", select:"_id full_name user_name profile_pic"}]);
        
        return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result, null, 200);
    },

    updateDebateStatus: async (data) => {
        let {_id , status} = data;
        let result = await updateData(Debate,{status,updated_at:new Date()},ObjectId(_id))
        if(result.status){
            if(status=='2'){ 
                return helpers.showResponse(true, Messages.DEBATE_DELETED_SUCCESS, result.data, null, 200);
            }else if(status=='1'){
                return helpers.showResponse(true, Messages.DEBATE_ENABLED_SUCCESS, result.data, null, 200);
            }
            return helpers.showResponse(true, Messages.DEBATE_DISABLED_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.UNABLETOUPDATE_STATUS, null, null, 200);
    },
    getD: async (data) => {
        let {year} = data;
        let query = {created_at:{$gte:year}}
         console.log("query", query);
         let result = await Debate.find(query);
        return helpers.showResponse(false, Messages.UNABLETOUPDATE_STATUS, result, null, 200);
    },
}
module.exports = { ...debateUtil }