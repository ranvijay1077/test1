var Messages = require("../utils/Debate/message");
var Debate = require('../utils/Debate');
let helpers = require('../services/helper')
let upload = require('../services/image-upload')
let singleUpload = upload.single('blog_image')
let path = require('path')
let Thumbler = require('thumbler');

const debateController = {
    getWeeklyDebate: async(req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.user_id = user_id;
        let result = await Debate.getWeeklyDebate(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    getWeeklyDebateTest: async(req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.user_id = user_id;
        let result = await Debate.getWeeklyDebateTest(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    addVote: async(req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        let requiredFields = ['debate_id','answer_id'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        req.body.user_id = user_id;
        let result = await Debate.addVote(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    addComment: async(req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        let requiredFields = ['debate_id','comment'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        req.body.user_id = user_id;
        let result = await Debate.addComment(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    deleteComment: async(req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        let requiredFields = ['comment_id'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        req.body.user_id = user_id;
        let result = await Debate.deleteComment(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    getD: async(req, res) => {
        let result = await Debate.getD(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    //admin apis
    addDebate: async(req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.admin_id = admin_id;

        let imageObj = []
        if (req.files) {
            if (req.files.debate_media) {
                for (let i = 0; i < req.files.debate_media.length; i++) {
                    let mime_type = req.files.debate_media[i].mimetype.split("/");
                    mime_type = mime_type[0];
                    if (mime_type === "image") {
                        imageObj.push({media :"debate_media/" + req.files.debate_media[i].filename, type:"image"})
                    } else if (mime_type === "video") {
                        let actualimagepath = `http://localhost:5070/files/debate_media/${req.files.debate_media[i].filename}`
                        let d = await debateController.getVideoThumb(actualimagepath);

                        imageObj.push({media:"debate_media/" + req.files.debate_media[i].filename, thumbnail:d.data.path,type:"video"})
                    }
                }
            }
        }
        req.body.image_data = imageObj;

        let result = await Debate.addDebate(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    getVideoThumb: async(data) => {
        return new Promise(async(resolve, reject) => {
            try {
                // let { file_url } = data;
                let actualimagepath = data
                let file_name = `${new Date().getTime()}.jpeg`;
                let localPath = path.join(__dirname, "../assets/debate_media/thumb/" + file_name)
                let thumbnail_time = '00:00:01';
              
                Thumbler({
                    type: 'video',
                    input: actualimagepath,
                    output: localPath,
                    time: thumbnail_time,
                }, async function(err, resp) {
                    if (err) {
                       console.log("erroe", err)
                        return resolve(helpers.showResponse(false, "Thumb Error", null, null, 200));
                    }
                  
                    return resolve(helpers.showResponse(true, "Thumb found", { path: "debate_media/thumb/" + file_name }, null, 200));
                })
            } catch (err) {
                console.log(err, " : err")
                resolve(helpers.showResponse(false, err.message, null, null, 200));
            }
        })
    },

    getDebateList: async(req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.admin_id = admin_id;

        let result = await Debate.getDebateList(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    updateDebateStatus: async(req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.admin_id = admin_id;

        let requiredFields = ['_id', 'status'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Debate.updateDebateStatus(req.body);
        return helpers.showOutput(res, result, result.code);
    },

}
module.exports = {
    ...debateController
}