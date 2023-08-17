"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("../utils/mongoose");
const mongoose_2 = require("../utils/mongoose");
const Year_1 = __importDefault(require("../models/Year"));
const errorMsg_1 = __importDefault(require("../utils/errorMsg"));
class YearController {
    // GET /
    index(req, res, next) {
        try {
            switch (req.params.slug) {
                case 'all':
                    Year_1.default.find({})
                        .then((genreResponse) => {
                        res.json((0, mongoose_2.multipleMongooseToObject)(genreResponse));
                    })
                        .catch((error) => {
                        res.status(400).json(errorMsg_1.default.errDefault);
                        next(error);
                    });
                    break;
                default:
                    res.status(400).json(errorMsg_1.default.errDefault);
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
exports.default = new YearController();
//# sourceMappingURL=YearController.js.map