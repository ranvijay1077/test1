require('../../db_functions')
let ExtraQues = require('../../models/ExtraQuestions')
let ObjectId = require('mongodb').ObjectId
let Messages = require("./message");
let helpers = require('../../services/helper')

const extraQuesUtil = {
    //===================Admin Apis===================
    getAllQuestions: async () => {
        let result = await getDataArray(ExtraQues, {status:{$ne:2}},'')
        if (result.status){
            return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.DATA_FOUND_FAILURE, null, null, 200);
    },
    addExtraQuestion: async (data) => {
        let { question } = data;
        let newObj = {
            question,
            created_at:new Date()
        };
        let quesRef = new ExtraQues(newObj)
        let result = await postData(quesRef);
        if (result.status) {
                return helpers.showResponse(true, Messages.QUES_ADDED_SUCCESS, result.data, null, 200);
            }
        return helpers.showResponse(true, Messages.QUES_ADDED_FAILURE, null, null, 200);
    },
    updateQuesStatus: async (data) => {
        let { _id, status } = data;
        let result = await updateData(ExtraQues,{status, updated_at:new Date()},ObjectId(_id))
        if (result.status) {
                return helpers.showResponse(true, Messages.UPDATED_SUCCESS, result.data, null, 200);
            }
        return helpers.showResponse(true, Messages.UPDATED_FAILURE, null, null, 200);
    },
 
}
module.exports = { ...extraQuesUtil }