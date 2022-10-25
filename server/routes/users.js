var express = require('express');
var router = express.Router();
var UserController = require('../controllers/Users');
var TermsController = require('../controllers/Terms');
var CourtController = require('../controllers/Court');
var TeamController = require('../controllers/Teams');
var BlogController = require('../controllers/Blogs');
var DebateController = require('../controllers/Debate');
var middleware = require('../controllers/middleware');

// Without Token Routes
router.post('/refresh', middleware.refreshToken);
router.post('/register', UserController.register);
router.post('/verify_otp', UserController.verifyOtp);
router.post('/resend_otp', UserController.resendOTP);
router.post('/forgot_password', UserController.forgotPassword);
router.post('/reset_password', UserController.resetPassword);
router.post('/login', UserController.login);
router.post('/reset_password', UserController.resetPassword);
router.post('/get_content',TermsController.getContent);


//With Token 
router.post('/get_profile', middleware.checkUserToken, UserController.getProfileDetail);
router.post('/update_profile', middleware.checkUserToken, UserController.updateProfile);
router.post('/upload_gallery_media', middleware.checkUserToken, UserController.uploadGalleryMedia);
router.post('/get_my_gallery', middleware.checkUserToken, UserController.getMyGallery);
router.post('/delete_gallery_media', middleware.checkUserToken, UserController.deleteGalleryMedia);
router.post('/logout', middleware.checkUserToken, UserController.logout);
router.post('/get_notification_list', middleware.checkUserToken, UserController.getNotificationList);
router.post('/delete_notification', middleware.checkUserToken, UserController.deleteNotification);


router.post('/add_court', middleware.checkUserToken, CourtController.addCourt);
router.post('/get_my_courts', middleware.checkUserToken, CourtController.getMyCourts);
router.post('/delete_my_court', middleware.checkUserToken, CourtController.deleteMyCourts);
router.post('/get_nearby_courts', middleware.checkUserToken, CourtController.getNearByCourts);
router.post('/update_check_in', middleware.checkUserToken, CourtController.updateCheckIn);
router.post('/get_active_users', middleware.checkUserToken, CourtController.getActiveUsers);
router.post('/get_video_thumb', UserController.getVideoThumb);


router.post('/add_team_player', middleware.checkUserToken, TeamController.addTeamPlayer);
router.post('/delete_team_player', middleware.checkUserToken, TeamController.deleteTeamPlayer);
router.post('/get_my_team_player', middleware.checkUserToken, TeamController.getMyTeamPlayer);
router.post('/get_player_detail', middleware.checkUserToken, TeamController.getPlayerDetail);

router.post('/add_bookmark', middleware.checkUserToken, CourtController.addBookmark);
router.post('/get_my_bookmarks', middleware.checkUserToken, CourtController.getMyBookMarkes);

// Blogs
router.post('/get_blogs', middleware.checkUserToken, BlogController.getAllBlogs);

//spotlight
router.post('/add_palyer_to_spotlight', middleware.checkUserToken, BlogController.addPlayerToSpotlight);
router.post('/get_spotlight', middleware.checkUserToken, BlogController.getSpotlightPlayers);

//weekly debate
router.post('/get_weekly_debate', middleware.checkUserToken, DebateController.getWeeklyDebate);
router.post('/get_weekly_debate_test', middleware.checkUserToken, DebateController.getWeeklyDebateTest);
router.post('/add_vote', middleware.checkUserToken, DebateController.addVote);
router.post('/add_comment', middleware.checkUserToken, DebateController.addComment);
router.post('/delete_comment', middleware.checkUserToken, DebateController.deleteComment);

router.post('/get_data_between_year', DebateController.getD);

//Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });


module.exports = router;