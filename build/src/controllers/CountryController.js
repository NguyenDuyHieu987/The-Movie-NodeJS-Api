"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const country_1 = __importDefault(require("@/models/country"));
class CountryController {
    async get(req, res, next) {
        try {
            switch (req.params.slug) {
                case 'all':
                    const data = await country_1.default.find();
                    res.json({ results: data });
                    break;
                default:
                    next(http_errors_1.default.NotFound(`Countries with slug: ${req.params.slug} is not found!`));
                    break;
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new CountryController();
//# sourceMappingURL=countryController.js.map