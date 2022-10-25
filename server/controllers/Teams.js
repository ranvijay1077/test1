let Team = require('../utils/Teams')
let Messages = require('../utils/Teams/message')
let helpers = require('../services/helper')
let upload = require('../services/image-upload')
let singleUpload = upload.single('Team_image')
let path = require('path')


const TeamController = {

    //**************Team APP APIS********************/
    addTeamPlayer: async (req, res) => {
            let user_id = req.decoded.user_id;
            if (!user_id) {
                return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
            }
    
            let requiredFields = ['player_id'];
            let validator = helpers.validateParams(req, requiredFields);
            if (!validator.status) {
                return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
            }
            req.body.user_id = user_id;
            if(user_id==req.body.player_id){
                return helpers.showOutput(res, helpers.showResponse(false, Messages.CANNOT_ADD_YOURSELF), 200);
            }
            let result = await Team.addTeamPlayer(req.body);
            return helpers.showOutput(res, result, result.code);
    },
    
    getMyTeamPlayer: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.user_id = user_id;
        let result = await Team.getMyTeamPlayer(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    getPlayerDetail: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        let requiredFields = ['player_id'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        req.body.user_id = user_id;
        let result = await Team.getPlayerDetail(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    deleteTeamPlayer: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        let requiredFields = ['player_id'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        req.body.user_id = user_id;
        let result = await Team.deleteTeamPlayer(req.body);
        return helpers.showOutput(res, result, result.code);
    },

}
module.exports = { ...TeamController }