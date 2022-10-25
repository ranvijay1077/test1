let Court = require('../utils/Court')
let Messages = require('../utils/Court/message')
let helpers = require('../services/helper')
let upload = require('../services/image-upload')
let singleUpload = upload.single('court_image')
let path = require('path')


const courtController = {

    //**************COURT APP APIS********************/
    addCourt: async (req, res) => {
        singleUpload(req, res, async (err) => {
            let user_id = req.decoded.user_id;
            if (!user_id) {
                return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
            }
            // console.log("req.file", req.file)
            if(!req.file) {
                return helpers.showOutput(res, helpers.showResponse(false, Messages.MEDIA_NOT_SELECTED), 403);
            }
            req.body.media = "court_image/" + req.file.filename;
            let requiredFields = ['name', 'location_name', 'lat', 'long'];
            let validator = helpers.validateParams(req, requiredFields);
            if (!validator.status) {
                return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
            }
            req.body.user_id = user_id;
            let result = await Court.createCourt(req.body);
            return helpers.showOutput(res, result, result.code);
        });
    },
   
    updateProfile: async (req, res) => {
        singleUpload(req, res, async (err) => {
            let user_id = req.decoded.user_id;
            if (!user_id) {
                return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
            }
            if (req.file) {
                req.body.profile_pic = "profile_pic/" + req.file.filename;
            }
         
            req.body.user_id = user_id;
          
            let result = await Court.updateProfile(req.body);
            return helpers.showOutput(res, result, result.code);
        });
    },

    getMyCourts: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.user_id = user_id;
        let result = await Court.getMyCourts(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    deleteMyCourts: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        let requiredFields = ['court_id'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        req.body.user_id = user_id;
        let result = await Court.deleteMyCourts(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    getNearByCourts: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        let requiredFields = ['lat', 'long'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        req.body.user_id = user_id;
        let result = await Court.getNearByCourts(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    
    updateCheckIn: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.user_id = user_id;

        let requiredFields = ['type','court_id','checkin_date_time'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Court.updateCheckIn(req.body);
        return helpers.showOutput(res, result, result.code);
    },
   
    getActiveUsers: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.user_id = user_id;

        let requiredFields = ['court_id'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Court.getActiveUsers(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    addBookmark: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.user_id = user_id;
        let requiredFields = ['court_id'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Court.addBookmark(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    getMyBookMarkes: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.user_id = user_id;

        let result = await Court.getMyBookMarkes(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    

    //=================ADMIN APIS====================
    getAllAdminCourts: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.admin_id = admin_id;
        let result = await Court.getAllAdminCourts(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    getAllUserCourts: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.admin_id = admin_id;
        let result = await Court.getAllUserCourts(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    addAdminCourt: async (req, res) => {
        singleUpload(req, res, async (err) => {
            let admin_id = req.decoded.admin_id;
            if (!admin_id) {
                return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
            }
            if(!req.file) {
                return helpers.showOutput(res, helpers.showResponse(false, Messages.MEDIA_NOT_SELECTED), 403);
            }

            req.body.media = "court_image/" + req.file.filename;
            let requiredFields = ['name', 'location_name', 'lat', 'long'];
            let validator = helpers.validateParams(req, requiredFields);
            if (!validator.status) {
                return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
            }
            req.body.admin_id = admin_id;
            let result = await Court.addAdminCourt(req.body);
            return helpers.showOutput(res, result, result.code);
        });
    },
    updateAdminCourt: async (req, res) => {
        singleUpload(req, res, async (err) => {
            let admin_id = req.decoded.admin_id;
            if (!admin_id) {
                return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
            }
            if(req.file) {
                req.body.media = "court_image/" + req.file.filename;  
            }
            let requiredFields = ['court_id','name', 'location_name', 'lat', 'long'];
            let validator = helpers.validateParams(req, requiredFields);
            if (!validator.status) {
                return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
            }
            req.body.admin_id = admin_id;
            let result = await Court.updateAdminCourt(req.body);
            return helpers.showOutput(res, result, result.code);
        });
    },
    updateAdminCourtStatus: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        let requiredFields = ['court_id', 'status'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        req.body.admin_id = admin_id;
        let result = await Court.updateAdminCourtStatus(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    getAdminCourtDetail: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        let requiredFields = ['court_id'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        req.body.admin_id = admin_id;
        let result = await Court.getAdminCourtDetail(req.body);
        return helpers.showOutput(res, result, result.code);
    }
   
   

}
module.exports = { ...courtController }