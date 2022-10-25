const multer = require('multer');
const path = require('path')

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
         console.log("file", file)
        let media_dest = '';
        if (file.fieldname == "profile_pic") {
            media_dest = `${__dirname}../../assets/profile_pic`
        }
        if (file.fieldname == "gallery_media") {
            media_dest = `${__dirname}../../assets/user_gallery`
        }
        if (file.fieldname == "court_image") {
            media_dest = `${__dirname}../../assets/court_image`
        }
        if (file.fieldname == "blog_image") {
            media_dest = `${__dirname}../../assets/blog`
        }
        if (file.fieldname == "debate_media") {
            media_dest = `${__dirname}../../assets/debate_media`
        }
        cb(null, media_dest)
    },
    filename: function(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
    }
})

const fileFilter = (req, file, cb) => {
    cb(null, true);
}

const upload = multer({
    fileFilter,
    storage
});


module.exports = upload;