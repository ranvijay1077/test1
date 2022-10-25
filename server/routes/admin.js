var express = require('express');
var router = express.Router();

var AdminController = require('../controllers/Admin');
var BlogController = require('../controllers/Blogs');
var DebateController = require('../controllers/Debate');
var CourtController = require('../controllers/Court');
var UserController = require('../controllers/Users');
var TermController = require('../controllers/Terms');
var ExtraQuesController = require('../controllers/ExtraQues');
var middleware = require("../controllers/middleware");
const upload = require('../services/image-upload')


router.post('/login', AdminController.login);
router.post('/forgot_password', AdminController.forgotPasswordMail);
router.post('/reset_password', AdminController.forgotChangePassword);
router.post('/get_admin_detail', middleware.checkAdminToken, AdminController.getAdminDetail);
router.post('/change_password', middleware.checkAdminToken, AdminController.changePasswordWithOld);
router.post('/update_admin_detail', middleware.checkAdminToken, AdminController.updateAdminDetail);

//blogs
router.post('/add_blog', middleware.checkAdminToken, BlogController.addBlog);
router.post('/update_blog', middleware.checkAdminToken, BlogController.updateBlog);
router.post('/get_blog_list', middleware.checkAdminToken, BlogController.getBlogList);
router.post('/get_blog_detail', middleware.checkAdminToken, BlogController.getBlogDetail);

//debate 
router.post('/add_debate', middleware.checkAdminToken,upload.fields([{ name: 'debate_media', maxCount: 10, }]), DebateController.addDebate);
router.post('/get_debate_list', middleware.checkAdminToken, DebateController.getDebateList);
router.post('/update_debate_status', middleware.checkAdminToken, DebateController.updateDebateStatus);

//users
router.post('/get_user_list', middleware.checkAdminToken, UserController.getUserList);
router.post('/update_blog_status', middleware.checkAdminToken, BlogController.updateBlogStatus);

//spotlight
router.post('/get_all_spotlight_player', middleware.checkAdminToken, BlogController.getAllSpotlightPlayers);
router.post('/update_spotlight_status', middleware.checkAdminToken, BlogController.updateSpotlightStatus);

//terms
router.post('/get_terms', middleware.checkAdminToken, TermController.getContent);
router.post('/update_terms', middleware.checkAdminToken, TermController.updateContent);

//dropdown category
router.post('/add_dropdown', middleware.checkAdminToken, TermController.addDropDown);
router.post('/get_dropdown_category', middleware.checkAdminToken, TermController.getDropdownCategory);
router.post('/update_dropdown_status', middleware.checkAdminToken, TermController.updateDropdownStatus);

//dropdown otpion (subcat)
router.post('/get_dropdown_sub_category', middleware.checkAdminToken, TermController.getDropdownSubCategory);
router.post('/update_dropdown_sub_cat_status', middleware.checkAdminToken, TermController.updateDropdownSubCategory);
router.post('/add_dropdown_subcategory', middleware.checkAdminToken, TermController.addDropdownSubcategory);

//cp player exra questions
router.post('/get_all_questions', middleware.checkAdminToken, ExtraQuesController.getAllQuestions);
router.post('/add_extra_question', middleware.checkAdminToken, ExtraQuesController.addExtraQuestion);
router.post('/update_question_status', middleware.checkAdminToken, ExtraQuesController.updateQuesStatus);

//courts
router.post('/get_all_admin_courts', middleware.checkAdminToken, CourtController.getAllAdminCourts);
router.post('/get_all_user_courts', middleware.checkAdminToken, CourtController.getAllUserCourts);
router.post('/add_admin_court', middleware.checkAdminToken, CourtController.addAdminCourt);
router.post('/update_admin_court', middleware.checkAdminToken, CourtController.updateAdminCourt);
router.post('/update_admin_court_status', middleware.checkAdminToken, CourtController.updateAdminCourtStatus);
router.post('/get_admin_court_detail', middleware.checkAdminToken, CourtController.getAdminCourtDetail);

module.exports = router;