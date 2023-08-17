"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const List_1 = __importDefault(require("../models/List"));
const movie_1 = __importDefault(require("../models/movie"));
const tv_1 = __importDefault(require("../models/tv"));
const errorMsg_1 = __importDefault(require("../utils/errorMsg"));
const ItemList_1 = require("../models/ItemList");
const mongoose_1 = require("../utils/mongoose");
const mongoose_2 = require("../utils/mongoose");
class ListController {
    // GET /
    index(req, res, next) {
        try {
            List_1.default.findOne({ id: req.params.slug })
                .then((listResponse) => {
                res.json((0, mongoose_1.mongooseToObject)(listResponse));
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
    addItem(req, res, next) {
        try {
            if (req.body.media_type === 'movie') {
                movie_1.default.findOne({
                    id: req.body.media_id,
                })
                    .then((dataMovies) => {
                    // res.json(mongooseToObject(listResponse));
                    const itemList = new ItemList_1.ItemList({
                        ...(0, mongoose_1.mongooseToObject)(dataMovies),
                        media_type: 'movie',
                    });
                    // itemList.save();
                    // console.log(itemList);
                    // res.json(mongooseToObject(dataMovies));
                    List_1.default.findOneAndUpdate({ id: req.params.slug }, { $addToSet: { items: itemList } }, { new: true }, (err, doc) => {
                        if (err) {
                            console.log('Something wrong when updating data!');
                        }
                    });
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
                    // res.json(mongooseToObject(listResponse));
                    const itemList = new ItemList_1.ItemList({
                        ...(0, mongoose_1.mongooseToObject)(dataTV),
                        media_type: 'tv',
                    });
                    // itemList.save();
                    // console.log(itemList);
                    // res.json(mongooseToObject(dataMovies));
                    List_1.default.findOneAndUpdate({ id: req.params.slug }, { $addToSet: { items: itemList } }, { new: true }, (err, doc) => {
                        if (err) {
                            console.log('Something wrong when updating data!');
                        }
                    });
                })
                    .catch((error) => {
                    res.status(400).json(errorMsg_1.default.errDefault);
                    next(error);
                });
            }
        }
        catch (error) {
            res.status(400).json(errorMsg_1.default.errDefault);
        }
        finally {
        }
    }
    removeItem(req, res, next) {
        try {
            List_1.default.findOneAndUpdate({ id: req.params.slug }, { $pull: { items: { id: req.body.media_id } } }, { new: true }, (err, doc) => {
                if (err) {
                    console.log('Something wrong when updating data!');
                }
            });
        }
        catch (error) {
            res.status(400).json(errorMsg_1.default.errDefault);
        }
        finally {
        }
    }
    newList(req, res, next) {
        try {
            List_1.default.findOneAndUpdate({ id: req.params.slug }, { $pull: { items: { id: req.body.media_id } } }, { new: true }, (err, doc) => {
                if (err) {
                    console.log('Something wrong when updating data!');
                }
            });
        }
        catch (error) {
            res.status(400).json(errorMsg_1.default.errDefault);
        }
        finally {
        }
    }
}
exports.default = new ListController();
//# sourceMappingURL=ListController.js.map