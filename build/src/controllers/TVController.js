"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tv_1 = __importDefault(require("@/models/tv"));
const Season_1 = __importDefault(require("@/models/Season"));
const tv_2 = __importDefault(require("@/models/tv"));
const errorMsg_1 = __importDefault(require("@/utils/errorMsg"));
const mongoose_1 = require("@/utils/mongoose");
class TVController {
    index(req, res, next) {
        try {
            switch (req.params.slug) {
                case 'phimbo':
                    tv_1.default.PhimBo.findOne({
                        page: req.query.page === undefined ? 1 : req.query.page,
                    })
                        .then((dataMovies) => {
                        res.json((0, mongoose_1.mongooseToObject)(dataMovies));
                    })
                        .catch((error) => {
                        res.status(400).json(errorMsg_1.default.errDefault);
                        next(error);
                    });
                    break;
                case 'airingtoday':
                    tv_1.default.TVAiringToday.findOne({
                        page: req.query.page === undefined ? 1 : req.query.page,
                    })
                        .then((dataMovies) => {
                        res.json((0, mongoose_1.mongooseToObject)(dataMovies));
                    })
                        .catch((error) => {
                        res.status(400).json(errorMsg_1.default.errDefault);
                        next(error);
                    });
                    break;
                case 'ontheair':
                    tv_1.default.TVOnTheAir.findOne({
                        page: req.query.page === undefined ? 1 : req.query.page,
                    })
                        .then((dataMovies) => {
                        res.json((0, mongoose_1.mongooseToObject)(dataMovies));
                    })
                        .catch((error) => {
                        res.status(400).json(errorMsg_1.default.errDefault);
                        next(error);
                    });
                    break;
                case 'popular':
                    tv_1.default.TVPopular.findOne({
                        page: req.query.page === undefined ? 1 : req.query.page,
                    })
                        .then((dataMovies) => {
                        res.json((0, mongoose_1.mongooseToObject)(dataMovies));
                    })
                        .catch((error) => {
                        res.status(400).json(errorMsg_1.default.errDefault);
                        next(error);
                    });
                    break;
                case 'toprated':
                    tv_1.default.TVTopRated.findOne({
                        page: req.query.page === undefined ? 1 : req.query.page,
                    })
                        .then((dataMovies) => {
                        res.json((0, mongoose_1.mongooseToObject)(dataMovies));
                    })
                        .catch((error) => {
                        res.status(400).json(errorMsg_1.default.errDefault);
                        next(error);
                    });
                    break;
                default:
                    // const arr = req.query.append_to_response.split(',');
                    // console.log(arr[0].trim());
                    // const arr = req.query.append_to_response
                    //   .split(',')
                    //   .join(',-')
                    //   .split(',');
                    // arr[0] = '-' + arr[0];
                    if (!req.query.append_to_response) {
                        tv_2.default.findOne({ id: req.params.slug })
                            .select(['-credits', '-similar', '-recommendations'])
                            .then((dataMovies) => {
                            // dataMovies == null
                            //   ? res.status(400).json(errorMsg.errDefault)
                            //   :
                            res.json((0, mongoose_1.mongooseToObject)(dataMovies));
                        })
                            .catch((error) => {
                            res.status(400).json(errorMsg_1.default.errDefault);
                            next(error);
                        });
                    }
                    else {
                        tv_2.default.findOne({ id: req.params.slug })
                            .select(['-credits', '-similar', '-recommendations'])
                            .then((dataMovies) => {
                            // dataMovies == null
                            //   ? res.status(404).json(errorMsg.errDefault)
                            //   :
                            tv_2.default.findOne({ id: req.params.slug })
                                .select(req.query.append_to_response.split(','))
                                .then((dataParams) => {
                                // dataMovies == null
                                //   ? res.status(404).json(errorMsg.errDefault)
                                //   :
                                res.json({
                                    ...(0, mongoose_1.mongooseToObject)(dataMovies),
                                    ...(0, mongoose_1.mongooseToObject)(dataParams),
                                });
                            })
                                .catch((error) => {
                                res.status(400).json(errorMsg_1.default.errDefault);
                                next(error);
                            });
                            // res.json(mongooseToObject(dataMovies));
                        })
                            .catch((error) => {
                            res.status(400).json(errorMsg_1.default.errDefault);
                            next(error);
                        });
                    }
                    break;
            }
        }
        catch (error) {
            res.status(400).json(errorMsg_1.default.errDefault);
        }
        finally {
        }
    }
    async season(req, res, next) {
        try {
            var doc = await tv_2.default.findOne({ id: req.params.movieid }, {
                seasons: {
                    $elemMatch: { season_number: +req.params.seasonnumber },
                },
            }).catch((error) => {
                res.status(400).json(errorMsg_1.default.errDefault);
                next(error);
            });
            Season_1.default.findOne({
                id: doc.seasons[0].id,
            })
                .then((seasonRes) => {
                res.json((0, mongoose_1.mongooseToObject)(seasonRes));
            })
                .catch((error) => {
                res.status(400).json(errorMsg_1.default.errDefault);
                next(error);
            });
        }
        catch (error) {
            res.status(400).json(errorMsg_1.default.errDefault);
        }
        finally {
        }
    }
    async update(req, res, next) {
        try {
            switch (req.params.slug1) {
                case 'rating':
                    let doc = await tv_2.default.findOne({
                        id: req.params.movieid,
                    }).catch((error) => {
                        res.status(400).json(errorMsg_1.default.errDefault);
                        next(error);
                    });
                    var newRating = (doc.vote_count * doc.vote_average + req.body.value) /
                        (doc.vote_count + 1);
                    doc.vote_average = newRating;
                    doc.vote_count += 1;
                    await doc.save();
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
exports.default = new TVController();
//# sourceMappingURL=TVController.js.map