"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WatchList_1 = __importDefault(require("../models/WatchList"));
const movie_1 = __importDefault(require("../models/movie"));
const tv_1 = __importDefault(require("../models/tv"));
const errorMsg_1 = __importDefault(require("../utils/errorMsg"));
const mongoose_1 = require("../utils/mongoose");
const mongoose_2 = require("../utils/mongoose");
const ItemList_1 = require("../models/ItemList");
class WatchListController {
    // GET /
    index(req, res, next) {
        try {
            switch (req.params.slug) {
                case 'all':
                    WatchList_1.default.findOne(
                    // {},
                    {
                        id: req.params.accountid,
                        // results: {
                        //   $slice: [
                        //     (req.query.page ? +req.query.page - 1 : 0) * 19,
                        //     req.query.page ? +req.query.page * 19 : 19,
                        //   ],
                        // },
                    })
                        // .skip((req.query.page - 1) * 20)
                        // .limit(20)
                        .then((listResponse) => {
                        res.json((0, mongoose_1.mongooseToObject)(listResponse));
                    })
                        .catch((error) => {
                        res.status(400).json(errorMsg_1.default.errDefault);
                        next(error);
                    });
                    break;
                case 'movie':
                    WatchList_1.default.aggregate([
                        { $match: { id: req.params.accountid } },
                        {
                            $project: {
                                results: {
                                    $filter: {
                                        input: '$results',
                                        as: 'item',
                                        cond: { $eq: ['$$item.media_type', 'movie'] },
                                    },
                                },
                            },
                        },
                    ])
                        .then((listResponse) => {
                        // res.json(multipleMongooseToObject(listResponse));
                        res.json(listResponse);
                    })
                        .catch((error) => {
                        console.log(error);
                        res.status(400).json(errorMsg_1.default.errDefault);
                        next(error);
                    });
                    break;
                case 'tv':
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
    handleWatchList(req, res, next) {
        try {
            console.log(req.body.media_type);
            if (req.body.media_type === 'movie') {
                movie_1.default.findOne({
                    id: req.body.media_id,
                })
                    .then((dataMovies) => {
                    if (req.body.watchlist === true) {
                        const itemList = new ItemList_1.ItemList({
                            ...(0, mongoose_1.mongooseToObject)(dataMovies),
                            media_type: 'movie',
                        });
                        WatchList_1.default.findOneAndUpdate({ id: req.params.slug }, { $addToSet: { results: itemList } }, { new: true }, (err, doc) => {
                            if (err) {
                                console.log(err);
                                console.log('Something wrong when updating data!');
                            }
                        });
                    }
                })
                    .catch((error) => {
                    res.status(400).json(errorMsg_1.default.errDefault);
                    next(error);
                });
            }
            else if (req.body.media_type === 'tv') {
                tv_1.default.findOne({
                    id: req.body.media_id,
                })
                    .then((dataTV) => {
                    if (req.body.watchlist === true) {
                        const itemList = new ItemList_1.ItemList({
                            ...(0, mongoose_1.mongooseToObject)(dataTV),
                            media_type: 'tv',
                        });
                        WatchList_1.default.findOneAndUpdate({ id: req.params.slug }, { $addToSet: { results: itemList } }, { new: true }, (err, doc) => {
                            if (err) {
                                console.log('Something wrong when updating data!');
                            }
                        });
                    }
                })
                    .catch((error) => {
                    res.status(400).json(errorMsg_1.default.errDefault);
                    next(error);
                });
            }
            else if (req.body.media_type === undefined) {
                if (req.body.watchlist === false) {
                    WatchList_1.default.findOneAndUpdate({ id: req.params.slug }, { $pull: { results: { id: req.body.media_id } } }, { new: true }, (err, doc) => {
                        if (err) {
                            console.log('Something wrong when updating data!');
                        }
                    });
                }
            }
        }
        catch (error) {
            res.status(400).json(errorMsg_1.default.errDefault);
        }
        finally {
        }
    }
}
exports.default = new WatchListController();
//# sourceMappingURL=WatchListController.js.map