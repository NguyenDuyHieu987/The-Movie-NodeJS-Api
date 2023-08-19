"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Search = new mongoose_1.default.Schema({
    comments: { ref: 'Comment' },
    posts: { ref: 'Post' },
});
exports.default = mongoose_1.default.model('movies', Search);
//# sourceMappingURL=search.js.map