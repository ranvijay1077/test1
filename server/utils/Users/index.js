require('../../db_functions')
let Users = require('../../models/Users')
let Dropdown = require('../../models/Dropdown')
let DropdownCategory = require('../../models/DropdownCategory')
let UserGallery = require('../../models/UserGallery')
let Notification = require('../../models/Notifications')
let ExtraQuestions = require('../../models/ExtraQuestions')
let Court = require('../../models/Courts')
let ObjectId = require('mongodb').ObjectId
let Messages = require("./message");
let helpers = require('../../services/helper')
let moment = require('moment')
let moment_timzone = require('moment-timezone')
let jwt = require('jsonwebtoken')
let md5 = require('md5')
let nodemailer = require('nodemailer');
const qr = require('qrcode');
let path = require('path');
let Thumbler = require('thumbler');
const { getVideoDurationInSeconds } = require('get-video-duration');
const { findOneAndUpdate } = require('../../models/Admin')


const userUtils = {
    //***********AUTH APIS********************/
    getUserTokenDetail: async (user_id) => {
        let queryObject = { _id: ObjectId(user_id), status: { $ne: 2 } };
        let result = await getSingleData(Users, queryObject, '');
        if (result.status) {
            return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.USER_DOESNT_EXIST, null, null, 200);
    },

    emailAlreadyExist: async (email) => {
        let queryObj = {
            email: email,
            status: { $ne: 2 }
        }
        let result = await getSingleData(Users, queryObj, '-password');
        if (result.status) {
            return helpers.showResponse(true, Messages.EMAIL_ALREDY_EXIST, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.DATA_FOUND_FAILURE, null, null, 200);
    },

    sendOTP: async (email, _id) => {
        let otp = helpers.randomStr(4, "1234567890")
        console.log("otp", otp);
        let uData = {
            otp,
            updated_at: moment().unix()
        }
        let update_otp = await updateData(Users, uData, ObjectId(_id))
        if (update_otp.status) {
            // return helpers.showResponse(true, Messages.OTP_SENT_SUCCESS, null, null, 200);
            try {
                try {
                    console.log("inside try", otp);
                    let transporter = nodemailer.createTransport({
                        host: "smtp.sendgrid.net",
                        port: 587,
                        secure: false, // true for 465, false for other ports
                        auth: {
                            user: process.env.SENDGRID_API, // generated ethereal user
                            pass: process.env.SENDGRID_API_KEY, // generated ethereal password
                        },
                    });
                    await transporter.sendMail({
                        from: `${process.env.FROM} <${process.env.EMAIL}>`, // sender address
                        to: email, // list of receivers
                        subject: "Account Verification", // Subject line
                        html: "<b>Greetings, </b><br /><br />Here is your 4 Digits email verification Code<br />" +
                            "<h2>" + otp + "</h2><br /><br /><label><small>Please use this code to verify your email." +
                            "</small></label><br /><br /><label>Thanks & Regards</label><br /><label> " +
                            "CheckBall</label><br/></br><small>This e-mail is intended only to be read or used by the addressee."+
                            "It is confidential and may contain legally privileged information. If you are not the addressee indicated"+
                            "in this message (or responsible for delivery of the message to such person),"+
                            "you may not copy or deliver this message to anyone, and you should destroy this message</small>",
                    });
                    return helpers.showResponse(true, Messages.OTP_SENT_SUCCESS, null, null, 200);
                } catch (err) {
                    console.log(err)
                    return helpers.showResponse(false, Messages.OTP_SENT_FAILURE, null, null, 200);
                }
                // return helpers.showResponse(true, Messages.OTP_SENT_SUCCESS, null, null, 200);
            } catch (err) {
                 console.log("inside error");
                console.log(err)
                return helpers.showResponse(false, Messages.OTP_SENT_FAILURE, null, null, 200);
            }
        }
        return helpers.showResponse(false, Messages.UNABLE_TO_UPDATE_OTP, null, null, 200);
    },

    resendOTP: async (data) => {
        let { email } = data;
        let otp = helpers.randomStr(4, "1234567890")
        let uData = {
            otp,
            updated_at: moment().unix()
        }
        let update_otp = await updateByQuery(Users, uData, { email })
        if (update_otp.status) {
            // return helpers.showResponse(true, Messages.OTP_SENT_SUCCESS, null, null, 200);
            try {
                console.log("inside try");
                let transporter = nodemailer.createTransport({
                    host: "smtp.sendgrid.net",
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: process.env.SENDGRID_API, // generated ethereal user
                        pass: process.env.SENDGRID_API_KEY, // generated ethereal password
                    },
                });
                await transporter.sendMail({
                    from: `${process.env.FROM} <${process.env.EMAIL}>`, // sender address
                    to: email, // list of receivers
                    subject: "Account Verification", // Subject line
                    html: "<b>Greetings, </b><br /><br />Here is your 4 Digits email verification Code<br />" +
                        "<h2>" + otp + "</h2><br /><br /><label><small>Please use this code to verify your email." +
                        "</small></label><br /><br /><label>Thanks & Regards</label><br /><label> " +
                        "CheckBall</label><br/></br><small>This e-mail is intended only to be read or used by the addressee."+
                        "It is confidential and may contain legally privileged information. If you are not the addressee indicated"+
                        "in this message (or responsible for delivery of the message to such person),"+
                        "you may not copy or deliver this message to anyone, and you should destroy this message</small>",
                });
                return helpers.showResponse(true, Messages.OTP_SENT_SUCCESS, null, null, 200);
            } catch (err) {
                console.log(err)
                return helpers.showResponse(false, Messages.OTP_SENT_FAILURE, null, null, 200);
            }
        }
        return helpers.showResponse(false, Messages.UNABLE_TO_UPDATE_OTP, null, null, 200);
    },

    sendForgotOTP: async (email) => {
        let otp = helpers.randomStr(4, "1234567890")
        //update otp
        console.log(otp);
        let uData = {
            otp,
            updated_at: moment().unix()
        }
        let update_otp = await updateByQuery(Users, uData, { email })
        if (update_otp) {
            // return helpers.showResponse(true, Messages.OTP_SENT_SUCCESS, null, null, 200);
            try {
                console.log("inside try");
                let transporter = nodemailer.createTransport({
                    host: "smtp.sendgrid.net",
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: process.env.SENDGRID_API, // generated ethereal user
                        pass: process.env.SENDGRID_API_KEY, // generated ethereal password
                    },
                });
                await transporter.sendMail({
                    from: `${process.env.FROM} <${process.env.EMAIL}>`, // sender address
                    to: email, // list of receivers
                    subject: "Forgot Password", // Subject line


                    html: "<b>Greetings, </b><br /><br />Here is your 4 Digits email verification Code<br />" +
                        "<h2>" + otp + "</h2><br /><br /><label><small>Please use this code to verify your email." +
                        "</small></label><br /><br /><label>Thanks & Regards</label><br /><label> " +
                        "CheckBall</label><br/></br><small>This e-mail is intended only to be read or used by the addressee."+
                        "It is confidential and may contain legally privileged information. If you are not the addressee indicated"+
                        "in this message (or responsible for delivery of the message to such person),"+
                        "you may not copy or deliver this message to anyone, and you should destroy this message</small>",
                });
                return helpers.showResponse(true, Messages.OTP_SENT_SUCCESS, null, null, 200);
            } catch (err) {
                console.log(err)
                return helpers.showResponse(false, Messages.OTP_SENT_FAILURE, null, null, 200);
            }
        }
        return helpers.showResponse(false, Messages.UNABLE_TO_UPDATE_OTP, null, null, 200);
    },

    generateQr: async (data) => {
        let strData = JSON.stringify({ _id: data._id, full_name: data.full_name, user_name: data.user_name, profile_pic: data.profile_pic })
        console.log("strData", strData);
        let qr_code = await qr.toDataURL(strData);
        if (qr_code) {
            console.log("qr_code", qr_code)
            let update = await updateData(Users, { qr_code }, ObjectId(data._id))
            if (update.status) {
                return helpers.showResponse(true, Messages.QR_GENERATE_SUCCESS, update.data, null, 200);
            }
        }
        return helpers.showResponse(false, Messages.QR_GENERATE_FAILURE, null, null, 200);
    },

    register: async (data) => {
        let { full_name, user_name, email, password, profile_pic, fcm_token } = data;
        let newObj = {
            full_name,
            user_name,
            email,
            fcm_token,
            password: md5(password),
            profile_pic,
        };
        //check if email already exist 
        let email_exist = await userUtils.emailAlreadyExist(email);
        if (email_exist.status) {
            if (email_exist.data.is_email_verified == 1) {
                return helpers.showResponse(false, Messages.EMAIL_ALREDY_EXIST, null, null, 200);
            }
            else {
                //update data and send OTP 
                let update_user = await updateData(Users, newObj, ObjectId(email_exist.data._id))
                if (update_user.status) {
                    let otp = await userUtils.sendOTP(email, email_exist.data._id)
                    if (otp.status) {
                        //generate qr code for user
                        let generate_qr = await userUtils.generateQr(update_user.data);
                        console.log("generate_qr", generate_qr);
                        return helpers.showResponse(true, Messages.OTP_SENT_SUCCESS, generate_qr.data, null, 200);
                    }
                    return helpers.showResponse(true, Messages.OTP_SENT_FAILURE, null, null, 200);
                }
            }
        }

        //create new user
        let userRef = new Users(newObj)
        let result = await postData(userRef);
        if (result.status) {
            let otp = await userUtils.sendOTP(email, result.data._id)
            if (otp.status) {
                //generate qr code for user
                let generate_qr = await userUtils.generateQr(result.data);
                console.log("generate_qr", generate_qr);
                return helpers.showResponse(true, Messages.OTP_SENT_SUCCESS, generate_qr.data, null, 200);
            }
            return helpers.showResponse(true, Messages.OTP_SENT_FAILURE, null, null, 200);
        }
        return helpers.showResponse(false, Messages.OTP_SENT_FAILURE, null, null, 200);
    },

    login: async (data) => {
        let { login_source } = data
        if (login_source == "google") {
            let { google_token, email, fcm_token, full_name } = data;
            if (email && email != "") {
                //check if email already exist 
                let email_exist = await getSingleData(Users, { email, status: { $ne: 2 } }, '');
                if (email_exist.status) {
                    if (email_exist.data.status == 0) {
                        return helpers.showResponse(false, Messages.DEACTIVATE_BY_ADMIN, null, null, 200);
                    }
                    //update google_token and fcm_token
                    let update = await updateData(Users, {google_token, fcm_token, login_source }, ObjectId(email_exist.data._id))
                    if (!update.status) {
                        return helpers.showResponse(false, Messages.FCM_UPDATE_FAILURE, null, null, 200);
                    }
                    let token = jwt.sign({ user_id: email_exist.data._id }, process.env.API_SECRET, {
                        expiresIn: process.env.JWT_EXPIRY
                    });
                    let other = { token };
                    return helpers.showResponse(true, Messages.LOGIN_SUCCESS, email_exist.data, other, 200);
                }
            }
            if (google_token && google_token != "") {
                //check if email already exist 
                let google_token_exist = await getSingleData(Users, { google_token, status: { $ne: 2 } }, '');
                if (google_token_exist.status) {
                    if (google_token_exist.data.status == 0) {
                        return helpers.showResponse(false, Messages.DEACTIVATE_BY_ADMIN, null, null, 200);
                    }
                    //update google_token and fcm_token
                    let update = await updateData(Users, {full_name, google_token, fcm_token, login_source }, ObjectId(google_token_exist.data._id))
                    if (!update.status) {
                        return helpers.showResponse(false, Messages.FCM_UPDATE_FAILURE, null, null, 200);
                    }
                    let token = jwt.sign({ user_id: google_token_exist.data._id }, process.env.API_SECRET, {
                        expiresIn: process.env.JWT_EXPIRY
                    });
                    let other = { token };
                    return helpers.showResponse(true, Messages.LOGIN_SUCCESS, google_token_exist.data, other, 200);
                }
            }
            //create new user
            let newObj = {
                full_name,
                google_token,
                email,
                // profile_pic,
                login_source: "google",
                is_email_verified: 1,
            }
            let userRef = new Users(newObj)
            let result = await postData(userRef);
            if (result.status) {
                //generate qr code for user
                let generate_qr = await userUtils.generateQr(result.data);
                console.log("generate_qr", generate_qr);

                let token = jwt.sign({ user_id: result.data._id }, process.env.API_SECRET, {
                    expiresIn: process.env.JWT_EXPIRY
                });
                let other = { token };
                return helpers.showResponse(true, Messages.LOGIN_SUCCESS, generate_qr.data, other, 200);
            }

        }
        else if (login_source == "email") {
            let { email, password, fcm_token } = data;
            // check if email exist 
            let email_exist = await userUtils.emailAlreadyExist(email);
            if (!email_exist.status) {
                return helpers.showResponse(false, Messages.EMAIL_DOESNOT_EXIST, null, null, 200);
            }
            if (email_exist.status) {
                if (email_exist.data.is_email_verified == 0) {
                    let otp = await userUtils.sendOTP(email, email_exist.data._id)
                    if (otp.status) {
                        return helpers.showResponse(true, Messages.EMAIL_NOT_VERIFIED_OTP_SENT, email_exist.data, null, 200);
                    }
                    return helpers.showResponse(true, Messages.OTP_SENT_FAILURE, null, null, 200);
                }
            }
            let result = await getSingleData(Users, { email, password: md5(password), is_email_verified: 1, status: { $ne: 2 } }, '');
            if (result.status) {
                if (result.data.status == 0) {
                    return helpers.showResponse(false, Messages.DEACTIVATE_BY_ADMIN, null, null, 200);
                }
                let update = await updateData(Users, { fcm_token, login_source }, ObjectId(result.data._id))
                if (!update.status) {
                    return helpers.showResponse(false, Messages.FCM_UPDATE_FAILURE, null, null, 200);
                }
                let token = jwt.sign({ user_id: update.data._id }, process.env.API_SECRET, {
                    expiresIn: process.env.JWT_EXPIRY
                });
                let other = { token };
                return helpers.showResponse(true, Messages.LOGIN_SUCCESS, result.data, other, 200);
            }
            return helpers.showResponse(false, Messages.LOGIN_FAILURE, null, null, 200);
        }
        else if (login_source == "apple") {
            let { email, apple_auth_token, fcm_token, full_name } = data;
            //check if email is present
            if (email && email != "") {
                //check if email already exist 
                let email_exist = await getSingleData(Users, { email, status: { $ne: 2 } }, '');
                if (email_exist.status) {
                    if (email_exist.data.status == 0) {
                        return helpers.showResponse(false, Messages.DEACTIVATE_BY_ADMIN, null, null, 200);
                    }
                    //update google_token and fcm_token
                    let update = await updateData(Users, { apple_auth_token, fcm_token, login_source }, ObjectId(email_exist.data._id))
                    if (!update.status) {
                        return helpers.showResponse(false, Messages.FCM_UPDATE_FAILURE, null, null, 200);
                    }
                    let token = jwt.sign({ user_id: email_exist.data._id, team_id: email_exist.data.team_id, user_type: email_exist.data.user_type }, process.env.API_SECRET, {
                        expiresIn: process.env.JWT_EXPIRY
                    });
                    let other = { token };
                    return helpers.showResponse(true, Messages.LOGIN_SUCCESS, email_exist.data, other, 200);
                }
            }
            //check if auth token exist
            let auth_exist = await getSingleData(Users, { apple_auth_token, status: { $ne: 2 } }, '-password')
            if (auth_exist.status) {
                if (auth_exist.data.status == 0) {
                    return helpers.showResponse(false, Messages.DEACTIVATE_BY_ADMIN, null, null, 200);
                }
                //update google_token and fcm_token
                let update = await updateData(Users, {full_name, fcm_token, login_source }, ObjectId(auth_exist.data._id))
                if (!update.status) {
                    return helpers.showResponse(false, Messages.FCM_UPDATE_FAILURE, null, null, 200);
                }
                let token = jwt.sign({ user_id: auth_exist.data._id, team_id: auth_exist.data.team_id, user_type: auth_exist.data.user_type }, process.env.API_SECRET, {
                    expiresIn: process.env.JWT_EXPIRY
                });
                let other = { token };
                return helpers.showResponse(true, Messages.LOGIN_SUCCESS, auth_exist.data, other, 200);
            }
            //create new user
            let newObj = {
                full_name,
                email,
                apple_auth_token,
                login_source: "apple",
                is_email_verified: 1,
            }
            let userRef = new Users(newObj)
            let result = await postData(userRef);
            if (result.status) {
                //generate qr code for user
                let generate_qr = await userUtils.generateQr(result.data);
                console.log("generate_qr", generate_qr);
                let token = jwt.sign({ user_id: result.data._id }, process.env.API_SECRET, {
                    expiresIn: process.env.JWT_EXPIRY
                });
                let other = { token };
                return helpers.showResponse(true, Messages.LOGIN_SUCCESS, generate_qr.data, other, 200);
            }
        }
        else {
            return helpers.showResponse(false, Messages.INVALID_LOGIN_SOURCE, null, null, 200);
        }
    },

    forgotPassword: async (data) => {
        let { email } = data
        let queryObject = {
            email,
            status: { $eq: 1 }
        }
        let result = await getSingleData(Users, queryObject, '-password');
        if (result.status) {
            let otp = await userUtils.sendForgotOTP(email)
            if (otp.status) {
                return helpers.showResponse(true, Messages.OTP_SENT_SUCCESS, null, null, 200);
            }
            return helpers.showResponse(true, Messages.OTP_SENT_FAILURE, null, null, 200);
        }
        return helpers.showResponse(false, Messages.EMAIL_NOT_REGISTERED, null, null, 200);
    },


    verifyOtp: async (data) => {
        let { email, otp } = data
        let queryObject = { email, otp, status: { $eq: 1 } };

        let result = await getSingleData(Users, queryObject, '');
        if (result.status) {
            let userObj = {
                otp: "",
                is_email_verified: 1,
                updated_at: moment().unix(),
            }
            let response = await updateData(Users, userObj, ObjectId(result.data._id));
            if (!response.status) {
                return helpers.showResponse(false, Messages.UNABLE_TO_UPDATE_OTP, null, null, 200);
            }
            let token = jwt.sign({ user_id: result.data._id }, process.env.API_SECRET, {
                expiresIn: process.env.JWT_EXPIRY
            });
            let other = { token };
            return helpers.showResponse(true, Messages.OTP_VERIFIED_SUCCESS, response.data, other, 200);
        }
        return helpers.showResponse(false, Messages.OTP_VERIFIED_FAILURE, null, null, 200);
    },

    resetPassword: async (data) => {
        let { _id, password } = data
        let updateObject = {
            password: md5(password),
            updated_at: moment().unix()
        }
        let result = await updateData(Users, updateObject, ObjectId(_id));
        if (result.status) {
            return helpers.showResponse(true, Messages.RESET_PASSWORD_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.RESET_PASSWORD_FAILURE, null, null, 200);
    },

    getProfileDetail: async (user_id) => {
        let queryObject = { _id: ObjectId(user_id), status: { $ne: 2 } };
        let result = await getSingleData(Users, queryObject, '',[{path:"user_extra_ques.question_id"}]);
        if (result.status) {
            let dropdown_result = await DropdownCategory.aggregate([
                {$match:{status:1}},
                {$lookup:{
                    from:"dropdown_sub_category",
                    foreignField:"category_id",
                    localField:"_id",
                    as:"data",
                   
                }},
            ])
            //get extra_question
            let temp =[]
            let questions = await getDataArray(ExtraQuestions,{status:1},'')
            if(questions.status){
                temp = questions.data;
            }
            let res = {...result.data._doc,extra_ques:temp}
            return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, res, dropdown_result, 200);
        }
        return helpers.showResponse(false, Messages.USER_DOESNT_EXIST, null, null, 200);
    },

    changePassword: async (data) => {
        let { user_id, old_password, new_password } = data;
        //check if old_password is valid 
        let queryObject = {
            password: md5(old_password),
            _id: ObjectId(user_id)
        }
        let old_pass_exist = await getSingleData(Users, queryObject, '')
        if (old_pass_exist.status) {
            if (old_password == new_password) {
                return helpers.showResponse(false, Messages.OLD_NEW_PASSWORD_SAME, null, null, 200);
            }
            let updateObj = {
                password: md5(new_password),
                updated_at: moment().unix()
            }
            let response = await updateData(Users, updateObj, ObjectId(old_pass_exist.data._id));
            if (response.status) {
                return helpers.showResponse(true, Messages.PASSWORD_CHANGED_SUCCESS, null, null, 200);
            }
            return helpers.showResponse(false, Messages.PASSWORD_CHANGED_FAILURE, null, null, 200);
        }
        return helpers.showResponse(false, Messages.INVALID_OLD_PASS, null, null, 200)
    },

    updateProfile: async (data) => {
        let { user_id, full_name, user_name, nick_name, selected_dropdowns,
             fav_nba_team, fav_nba_player, profile_pic, fcm_token, extra_ques_array } = data;
        let updateObj = {
            updated_at: new Date()
        };
        console.log("extra_ques_array", extra_ques_array)
        let user_extra_ques=[];
        let dropdown_selected = [];
        if(selected_dropdowns){
            dropdown_selected = JSON.parse(selected_dropdowns)
        }
        if(extra_ques_array){
            user_extra_ques = JSON.parse(extra_ques_array)
        }
        updateObj.nick_name = ''
        updateObj.fav_nba_team = ''
        updateObj.fav_nba_player = ''
        if (full_name) {
            updateObj.full_name = full_name
        }
        if (user_name) {
            updateObj.user_name = user_name
        }
        if (nick_name) {
            updateObj.nick_name = nick_name
        }
        if(dropdown_selected.length>0){
            updateObj.selected_dropdowns = dropdown_selected
        }
      
         console.log("user_extra_ques", user_extra_ques.length)
        if(user_extra_ques.length<1){
            updateObj.user_extra_ques = user_extra_ques
        }
        if (fav_nba_team) {
            updateObj.fav_nba_team = fav_nba_team
        }
        if (fav_nba_player) {
            updateObj.fav_nba_player = fav_nba_player
        }
        if (profile_pic) {
            updateObj.profile_pic = profile_pic
        }
        if (fcm_token) {
            updateObj.fcm_token = fcm_token
        }
        let update_user = await updateData(Users,updateObj, ObjectId(user_id))
        if (update_user.status) {
            if(user_extra_ques.length>0){
                for(var i = 0;i<user_extra_ques.length;i++){
                    //if exist then update else add
                    // let d = await Users.findOneAndUpdate({_id:ObjectId(user_id) , 
                    //                                         user_extra_ques:{$elemMatch: {question_id:ObjectId(user_extra_ques[i].question_id)}}},
                    //                                         {answer:user_extra_ques[i].answer})
                    let d = await Users.findOneAndUpdate({_id:ObjectId(user_id) ,user_extra_ques:{$elemMatch: {question_id:ObjectId(user_extra_ques[i].question_id)}}},
                                                        { $set: { "user_extra_ques.$.answer": user_extra_ques[i].answer}})
                     console.log("d====>", d)
                    if(d==null){
                        //push in db 
                        let push =  await Users.updateOne(
                            { _id: ObjectId(user_id) },
                            { $push: { user_extra_ques: {question_id: user_extra_ques[i].question_id,
                                                        answer: user_extra_ques[i].answer} }
                            }
                         )
                          console.log("push", push)
                    }

                    }
            }
            // generate qr code 
            let generate_qr = await userUtils.generateQr(update_user.data);
            let get_user_detail = await userUtils.getProfileDetail(user_id);
            return helpers.showResponse(true, Messages.PROFILE_UPDATE_SUCCESS, get_user_detail.data, get_user_detail.other, 200);
        }
        return helpers.showResponse(false, Messages.PROFILE_UPDATE_FAILURE, null, null, 200);
    },

    uploadUserGallery: async (data) => {
        let d = new UserGallery(data);
        let result = await postData(d)
        if (result.status) {
            let d = await userUtils.getMyGallery(data);
            return helpers.showResponse(true, Messages.MEDIA_UPLOADED_SUCCESS, d.data, null, 200);
        }
        return helpers.showResponse(false, Messages.MEDIA_UPLOADED_FAILURE, null, null, 200);
    },

    getMyGallery: async (data) => {
         let {user_id} = data;
        let result = await getDataArray(UserGallery,{user_id:ObjectId(user_id), status:1},'')
        if (result.status) {
            return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.DATA_FOUND_FAILURE, null, null, 200);
    },

    deleteGalleryMedia: async (data) => {
         let {user_id, gallery_id} = data;
        let result = await updateByQuery(UserGallery,{status:2},{user_id:ObjectId(user_id), _id:ObjectId(gallery_id)})
        if (result.status) {
            let d = await userUtils.getMyGallery(data);
            return helpers.showResponse(true, Messages.MEDIA_DELETED_SUCCESS, d.data, null, 200);
        }
        return helpers.showResponse(false, Messages.MEDIA_DELETED_FAILURE, null, null, 200);
    },

    deleteNotification: async (data) => {
         let {notification_id} = data;
        let result = await updateData(Notification,{status:2},ObjectId(notification_id))
        if (result.status) {
            return helpers.showResponse(true, Messages.NOTIFICATION_DELETE_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.NOTIFICATION_DELETE_FAILURE, null, null, 200);
    },

    getNotificationList: async (data) => {
        let {user_id} = data;
        let result = await getDataArray(Notification,{send_to:ObjectId(user_id), status:1},'',null,{created_at:-1},{path:"send_to",select:"_id profile_pic"})
        if(result.status){
         return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.DATA_FOUND_FAILURE, null, null, 200);
    },

    getVideoThumb: async(data) => {
        return new Promise(async(resolve, reject) => {
            try {
                let { file_url } = data;
                // get video duration 
                const duration = await getVideoDurationInSeconds(file_url)
                let actualimagepath = file_url
                let file_name = `${new Date().getTime()}.jpeg`;
                let localPath = path.join(__dirname, "/../../assets/user_chat/thumbs/" + file_name)
                let thumbnail_time = '00:00:01';
                // if(duration>="1000" && duration<="2000"){
                //     thumbnail_time = '00:00:01';
                // }
                Thumbler({
                    type: 'video',
                    input: actualimagepath,
                    output: localPath,
                    time: thumbnail_time,
                }, async function(err, resp) {
                    if (err) {
                        console.log("err", err)
                        return resolve(helpers.showResponse(false, "Thumb Error", null, null, 200));
                    }
                    console.log("resp", resp)
                    return resolve(helpers.showResponse(true, "Thumb found", { path: "user_chat/thumbs/" + file_name, duration: parseInt(duration) }, null, 200));
                })
            } catch (err) {
                console.log(err, " : err")
                resolve(helpers.showResponse(false, err.message, null, null, 200));
            }
        })
    },

    logout: async (data) => {
        let {user_id} = data;
        let updateObj = {updated_at:new Date(), fcm_token:''}
        let result = await updateData(Users,updateObj,ObjectId(user_id))
        if (result.status) {

            let pull_data = await Court.updateMany(
                { },
                { $pull:{checked_in_users:{user_id:ObjectId(user_id)}}},
                {multi: true}
        )      
         return helpers.showResponse(true, Messages.LOGOUT_SUCCESS, null, null, 200);
        }
        return helpers.showResponse(false, Messages.LOGOUT_FAILURE, null, null, 200);
    },

    // ______ADMIN APIS________
    
    getUserList:async(data)=>{
        let result = await getDataArray(Users,{status:{$ne:2}},'', null, {created_at:-1})
        if(result.status){
         return helpers.showResponse(true, Messages.DATA_FOUND_SUCCESS, result.data, null, 200);
        }
        return helpers.showResponse(false, Messages.DATA_FOUND_FAILURE, null, null, 200); 
    }
 
}
module.exports = { ...userUtils }