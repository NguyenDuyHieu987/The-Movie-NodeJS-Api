"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTV = exports.getMovie = exports.getAll = void 0;
const errorMsg_1 = __importDefault(require("../utils/errorMsg"));
const mongoose_1 = require("../utils/mongoose");
const mongoose_2 = require("../utils/mongoose");
const movie_1 = __importDefault(require("../models/movie"));
const tv_1 = __importDefault(require("../models/tv"));
function getAll(paramsMongooseMovie, paramsMongooseTV, paramsSortMovie, paramsSortTV, res, req) {
    movie_1.default.find(paramsMongooseMovie)
        .sort(paramsSortMovie)
        .skip((req.query.page - 1) * 10)
        .limit(10)
        .then((dataMovies) => {
        // res.json(multipleMongooseToObject(dataMovies));
        tv_1.default.find(paramsMongooseTV)
            .sort(paramsSortTV)
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
}
exports.getAll = getAll;
function getMovie(paramsMongoose, paramsSortMovie, res, req) {
    movie_1.default.find(paramsMongoose)
        .sort(paramsSortMovie)
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
}
exports.getMovie = getMovie;
function getTV(paramsMongoose, paramsSortTV, res, req) {
    tv_1.default.find(paramsMongoose)
        .sort(paramsSortTV)
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
}
exports.getTV = getTV;
//# sourceMappingURL=discoverHandle.js.map