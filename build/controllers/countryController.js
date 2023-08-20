"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const country_1 = __importDefault(require("@/models/country"));
const redis_1 = __importDefault(require("@/config/redis"));
class CountryController extends redis_1.default {
    async get(req, res, next) {
        try {
            const key = req.originalUrl;
            const dataCache = await redis_1.default.client.get(key);
            if (dataCache != null) {
                return res.json(JSON.parse(dataCache));
            }
            switch (req.params.slug) {
                case 'all':
                    const data = await country_1.default.find();
                    const response = { results: data };
                    await redis_1.default.client.setEx(key, +process.env.REDIS_CACHE_TIME, JSON.stringify(response));
                    res.json(response);
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