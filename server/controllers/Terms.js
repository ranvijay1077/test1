const Terms     =    require('../utils/Terms')
const Messages  =    require('../utils/Terms/message')
const helpers   =    require('../services/helper')

const termController = {
    
    //**************APP API********************/
    getContent: async (req, res) => {
        let result = await Terms.getContent();
        return helpers.showOutput(res, result, result.code);
    },
   

    updateContent: async(req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, Messages.USER_DOESNT_EXIST), 403);
        }
        req.body.admin_id = admin_id;

        let requiredFields = ['_id', 'type','content'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Terms.updateContent(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    //**************ADMIN API*******************/
    addDropDown: async (req, res) => {
        let requiredFields = ['category_name','sub_cat_array'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Terms.addDropDown(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    getDropdownCategory: async (req, res) => {
        let result = await Terms.getDropdownCategory();
        return helpers.showOutput(res, result, result.code);
    },
    updateDropdownStatus: async (req, res) => {
        let requiredFields = ['category_id', 'status'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Terms.updateDropdownStatus(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    getDropdownSubCategory: async (req, res) => {
        let requiredFields = ['category_id'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Terms.getDropdownSubCategory(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    updateDropdownSubCategory: async (req, res) => {
        let requiredFields = ['subcat_id', 'status'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Terms.updateDropdownSubCategory(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    addDropdownSubcategory: async (req, res) => {
        let requiredFields = ['category_id', 'name'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Terms.addDropdownSubcategory(req.body);
        return helpers.showOutput(res, result, result.code);
    },
}
module.exports = { ...termController }