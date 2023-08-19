"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const Video = new mongoose_1.default.Schema({
    id: { type: String, default: (0, uuid_1.v4)() },
    items: { type: Array },
}, { timestamps: true });
exports.default = mongoose_1.default.model('videos', Video);
//# sourceMappingURL=video.js.map