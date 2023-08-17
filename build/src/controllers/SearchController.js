"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const movie_1 = __importDefault(require("../models/movie"));
const tv_1 = __importDefault(require("../models/tv"));
const errorMsg_1 = __importDefault(require("../utils/errorMsg"));
const mongoose_1 = require("../utils/mongoose");
const mongoose_2 = require("../utils/mongoose");
class SearchController {
    index(req, res, next) {
        try {
            switch (req.params.slug) {
                case 'multi':
                    movie_1.default.find({
                        $or: [
                            { name: { $regex: req.query.query, $options: 'i' } },
                            { title: { $regex: req.query.query, $options: 'i' } },
                        ],
                    })
                        .skip((req.query.page - 1) * 10)
                        .limit(10)
                        .then((dataMovies) => {
                        // res.json(multipleMongooseToObject(dataMovies));
                        tv_1.default.find({
                            $or: [
                                { name: { $regex: req.query.query, $options: 'i' } },
                                { title: { $regex: req.query.query, $options: 'i' } },
                            ],
                        })
                            .skip((req.query.page - 1) * 10)
                            .limit(10)
                            .then((dataTV) => {
                            res.json({
                                results: (0, mongoose_2.multipleMongooseToObject)(dataMovies).concat((0, mongoose_2.multipleMongooseToObject)(dataTV)),
                            });
                            // res.json(multipleMongooseToObject(dataMovies));
                        })
                            .catch((error) => {
                            res.status(400).json(errorMsg_1.default.errDefault);
                            next(error);
                        });
                    })
                        .catch((error) => {
                        res.status(400).json(errorMsg_1.default.errDefault);
                        next(error);
                    });
                    break;
                case 'movie':
                    movie_1.default.find({
                        $or: [
                            { name: { $regex: req.query.query, $options: 'i' } },
                            { title: { $regex: req.query.query, $options: 'i' } },
                        ],
                    })
                        .skip((req.query.page - 1) * 20)
                        .limit(20)
                        .then((dataMovies) => {
                        res.json({
                            results: (0, mongoose_2.multipleMongooseToObject)(dataMovies),
                        });
                    })
                        .catch((error) => {
                        res.status(400).json(errorMsg_1.default.errDefault);
                        next(error);
                    });
                    break;
                case 'tv':
                    tv_1.default.find({
                        $or: [
                            { name: { $regex: req.query.query, $options: 'i' } },
                            { title: { $regex: req.query.query, $options: 'i' } },
                        ],
                    })
                        .skip((req.query.page - 1) * 20)
                        .limit(20)
                        .then((dataMovies) => {
                        res.json({
                            results: (0, mongoose_2.multipleMongooseToObject)(dataMovies),
                        });
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
exports.default = new SearchController();
//# sourceMappingURL=SearchController.js.map