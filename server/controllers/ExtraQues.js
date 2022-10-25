const ExtraQues     =    require('../utils/ExtraQues')
const Messages  =    require('../utils/ExtraQues/message')
const helpers   =    require('../services/helper')

const extraQuesController = {
    //**************ADMIN API*******************/
    getAllQuestions: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.admin_id = admin_id;
        let result = await ExtraQues.getAllQuestions(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    addExtraQuestion: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        let requiredFields = ['question'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        req.body.admin_id = admin_id;
        let result = await ExtraQues.addExtraQuestion(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    updateQuesStatus: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        let requiredFields = ['_id', 'status'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        req.body.admin_id = admin_id;
        let result = await ExtraQues.updateQuesStatus(req.body);
        return helpers.showOutput(res, result, result.code);
    },
}
module.exports = { ...extraQuesController }