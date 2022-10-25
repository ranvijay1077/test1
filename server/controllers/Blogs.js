var Messages = require("../utils/Blogs/message");
var Blogs = require('../utils/Blogs');
let helpers = require('../services/helper')
let upload = require('../services/image-upload')
let singleUpload = upload.single('blog_image')
let path = require('path')

const blogController = {
    getAllBlogs: async(req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        let result = await Blogs.getAllBlogs();
        return helpers.showOutput(res, result, result.code);
    },
    addPlayerToSpotlight: async(req, res) => {
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
        let result = await Blogs.addPlayerToSpotlight(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    getSpotlightPlayers: async(req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.user_id = user_id;
        let result = await Blogs.getSpotlightPlayers(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    
    //===================+++ADMIN APIS++++==================
        addBlog: async (req, res) => {
            singleUpload(req, res, async (err) => {
                let admin_id = req.decoded.admin_id;
                if (!admin_id) {
                    return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
                }
                console.log("req.file", req.file)
                if(!req.file) {
                    return helpers.showOutput(res, helpers.showResponse(false, Messages.MEDIA_NOT_SELECTED), 403);
                }
   
                
                req.body.media = "blog/" + req.file.filename;
                let requiredFields = ['title', 'description'];
                let validator = helpers.validateParams(req, requiredFields);
                if (!validator.status) {
                    return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
                }
                req.body.admin_id = admin_id;
                let result = await Blogs.addBlog(req.body);
                return helpers.showOutput(res, result, result.code);
            });
        },
        updateBlog: async (req, res) => {
            singleUpload(req, res, async (err) => {
                let admin_id = req.decoded.admin_id;
                if (!admin_id) {
                    return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
                }
                if(req.file) {
                    req.body.media = "blog/" + req.file.filename;
                } 
                let requiredFields = ['blog_id'];
                let validator = helpers.validateParams(req, requiredFields);
                if (!validator.status) {
                    return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
                }
                req.body.admin_id = admin_id;
                let result = await Blogs.updateBlog(req.body);
                return helpers.showOutput(res, result, result.code);
            });
        },
        getBlogDetail: async (req, res) => {
                let admin_id = req.decoded.admin_id;
                if (!admin_id) {
                    return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
                }
                let requiredFields = ['blog_id'];
                let validator = helpers.validateParams(req, requiredFields);
                if (!validator.status) {
                    return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
                }
                req.body.admin_id = admin_id;
                let result = await Blogs.getBlogDetail(req.body);
                return helpers.showOutput(res, result, result.code);
        },

        getBlogList: async(req, res) => {
            let admin_id = req.decoded.admin_id;
            if (!admin_id) {
                return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
            }
            let result = await Blogs.getBlogList();
            return helpers.showOutput(res, result, result.code);
        },

        getAllSpotlightPlayers: async(req, res) => {
            let admin_id = req.decoded.admin_id;
            if (!admin_id) {
                return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
            }
            req.body.admin_id = admin_id;
            let result = await Blogs.getAllSpotlightPlayers(req.body);
            return helpers.showOutput(res, result, result.code);
        },
        updateSpotlightStatus: async(req, res) => {
            let admin_id = req.decoded.admin_id;
            if (!admin_id) {
                return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
            }
            req.body.admin_id = admin_id;

            let requiredFields = ['_id', 'is_spotlighted'];
            let validator = helpers.validateParams(req, requiredFields);
            if (!validator.status) {
                return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
            }
            let result = await Blogs.updateSpotlightStatus(req.body);
            return helpers.showOutput(res, result, result.code);
        },
        updateBlogStatus: async(req, res) => {
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
            let result = await Blogs.updateBlogStatus(req.body);
            return helpers.showOutput(res, result, result.code);
        },
    


}
module.exports = {
    ...blogController
}