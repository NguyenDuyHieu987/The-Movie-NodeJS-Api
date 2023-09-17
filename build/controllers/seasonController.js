"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const tv_1 = __importDefault(require("@/models/tv"));
const season_1 = __importDefault(require("@/models/season"));
const redis_1 = __importDefault(require("@/config/redis"));
class SeasonController extends redis_1.default {
    constructor() {
        super();
    }
    async get(req, res, next) {
        try {
            const movieId = req.params.movieId;
            const seasonNumber = +req.params.seasonNumber;
            const key = req.originalUrl;
            const dataCache = await redis_1.default.client.get(key);
            if (dataCache != null) {
                return res.json(JSON.parse(dataCache));
            }
            const tv = await tv_1.default.findOne({
                id: movieId,
            }, {
                seasons: {
                    $elemMatch: { season_number: seasonNumber },
                },
            });
            if (tv != null && tv.seasons.length > 0) {
                const seasonId = tv.seasons[0].id;
                const season = await season_1.default.findOne({
                    id: seasonId,
                    season_number: seasonNumber,
                });
                if (season != null) {
                    await redis_1.default.client.setEx(key, +process.env.REDIS_CACHE_TIME, JSON.stringify(season));
                    res.json(season);
                }
                else {
                    next(http_errors_1.default.NotFound(`Season is not exist`));
                }
            }
            else {
                next(http_errors_1.default.NotFound(`Movie is not exist`));
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new SeasonController();
//# sourceMappingURL=seasonController.js.map