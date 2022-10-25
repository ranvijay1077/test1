const Users = require('../utils/Users')
const Messages = require('../utils/Users/message')
const helpers = require('../services/helper')
const upload = require('../services/image-upload')
const singleUpload = upload.single('profile_pic')
const singleUploadMedia = upload.single('gallery_media')
let path = require('path')
let Thumbler = require('thumbler');

const userController = {

    //**************AUTH APPI********************/
    register: async (req, res) => {
        singleUpload(req, res, async (err) => {
            if (req.file) {
                req.body.profile_pic = "profile_pic/" + req.file.filename;
            }
            let requiredFields = ['full_name', 'user_name', 'email', 'password'];

            let validator = helpers.validateParams(req, requiredFields);
            if (!validator.status) {
                return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
            }
            req.body.email = req.body.email.trim();
            let result = await Users.register(req.body);
            return helpers.showOutput(res, result, result.code);
        });
    },
    login: async (req, res) => {
        let requiredFields = ['login_source'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        if (req.body.login_source == "google") {
            let requiredFields = ['google_token'];
            let validator = helpers.validateParams(req, requiredFields);
            if (!validator.status) {
                return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
            }
            if (req.body.email) {
                req.body.email = req.body.email.trim();
            }
        }
        else if (req.body.login_source == "apple") {
            let requiredFields = ['apple_auth_token',];
            let validator = helpers.validateParams(req, requiredFields);
            if (!validator.status) {
                return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
            }
            if (req.body.email) {
                req.body.email = req.body.email.trim();
            }
        }
        else if (req.body.login_source == "email") {
            let requiredFields = ['email', 'password',];
            let validator = helpers.validateParams(req, requiredFields);
            if (!validator.status) {
                return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
            }
            req.body.email = req.body.email.trim();
        }

        let result = await Users.login(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    
    verifyOtp: async (req, res) => {
        let requiredFields = ['email', 'otp'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Users.verifyOtp(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    resendOTP: async (req, res) => {
        let requiredFields = ['email'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Users.resendOTP(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    forgotPassword: async (req, res) => {
        let requiredFields = ['email'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Users.forgotPassword(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    resetPassword: async (req, res) => {
        let requiredFields = ['_id', 'password'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Users.resetPassword(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    getProfileDetail: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        let result = await Users.getProfileDetail(user_id);
        return helpers.showOutput(res, result, result.code);
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
          
            let result = await Users.updateProfile(req.body);
            return helpers.showOutput(res, result, result.code);
        });
    },

    uploadGalleryMedia: async (req, res) => {
        singleUploadMedia(req, res, async(err) => {
            let user_id = req.decoded.user_id;
            if (!user_id) {
                return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
            }
            req.body.user_id = user_id;
            if (!req.file) {
                return helpers.showOutput(res, helpers.showResponse(false, Messages.MEDIA_NOT_SELECTED), 203);
            }

            let requiredFields = ['title'];
            let validator = helpers.validateParams(req, requiredFields);
            if (!validator.status) {
                return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
            }

            let { filename } = req.file;
            let mime_type = req.file.mimetype.split("/");
            if (mime_type[0] == "video") {
                let actualimagepath = `http://localhost:5070/files/user_gallery/${filename}`
                let thumbnail_file_name = `${new Date().getTime()}.jpeg`;
                // let localPath = path.resolve(`server/assets/user_gallery/thumbnail/${thumbnail_file_name}`)
                let localPath = `server/assets/user_gallery/thumbnail/${thumbnail_file_name}`
                Thumbler({
                    type: 'video',
                    input: actualimagepath,
                    output: localPath,
                    time: '00:00:02',
                    // size: '1024*1024', // this optional if null will use the desimention of the video
                }, async function(err, path) {
                    if (err) {
                        console.log("thumberr", err)
                        return helpers.showResponse(false, Messages.THUMBNAIL_ERROR, err, null, 200);
                    }
                    let dataObj = {
                        user_id:user_id,
                        media: "user_gallery/" + filename,
                        thumbnail: "user_gallery/thumbnail/" + thumbnail_file_name,
                        media_type: mime_type[0],
                        title: req.body.title,
                    }
                    let result = await Users.uploadUserGallery(dataObj)
                    return helpers.showOutput(res, result, result.code);
                });

            }
        });
    },

    getMyGallery: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.user_id = user_id;
        let result = await Users.getMyGallery(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    deleteGalleryMedia: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.user_id = user_id;

        let requiredFields = ['gallery_id'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Users.deleteGalleryMedia(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    getNotificationList: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.user_id = user_id;

        let result = await Users.getNotificationList(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    deleteNotification: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.user_id = user_id;

        let requiredFields = ['notification_id'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Users.deleteNotification(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    getVideoThumb: async(req, res) => {
        let requiredFields = ['file_url'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Users.getVideoThumb(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    logout: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.user_id = user_id;

        let result = await Users.logout(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    // ---------------------_ADMIN APIS-----------------------------

    getUserList : async(req, res)=>{
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.admin_id = admin_id;
        let result = await Users.getUserList(req.body);
        return helpers.showOutput(res, result, result.code);
    }
    

}
module.exports = { ...userController }