"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Country_1 = __importDefault(require("../models/Country"));
const errorMsg_1 = __importDefault(require("../utils/errorMsg"));
const mongoose_1 = require("../utils/mongoose");
const mongoose_2 = require("../utils/mongoose");
class CountryController {
    // GET /
    index(req, res, next) {
        try {
            switch (req.params.slug) {
                case 'all':
                    Country_1.default.find({})
                        .then((countryResponse) => {
                        res.json((0, mongoose_2.multipleMongooseToObject)(countryResponse));
                    })
                        .catch((error) => {
                        res.status(400).json(errorMsg_1.default.errDefault);
                        next(error);
                    });
                    break;
                default:
                    Country_1.default.findOne({ name2: req.params.slug })
                        .then((countryResponse) => {
                        res.json((0, mongoose_1.mongooseToObject)(countryResponse));
                    })
                        .catch((error) => {
                        res.status(400).json(errorMsg_1.default.errDefault);
                        next(error);
                    });
                    break;
            }
        }
        catch (error) {
            res.status(400).json(errorMsg_1.default.errDefault);
        }
        finally {
        }
    }
}
exports.default = new CountryController();
//# sourceMappingURL=CountryController.js.map