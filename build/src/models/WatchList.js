"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ItemList_1 = require("./ItemList");
const Schema = mongoose_1.default.Schema;
const WatchList = new Schema({
    created_by: { type: String },
    description: { type: String },
    favorite_count: { type: Number },
    id: { type: String },
    item_count: { type: Number },
    iso_639_1: { type: String },
    name: { type: String },
    poster_path: { type: String },
    // results: [typeOfItem],
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.model('WatchList', WatchList);
//# sourceMappingURL=WatchList.js.map