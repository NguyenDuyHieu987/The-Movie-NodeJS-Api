"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const Plan = new mongoose_1.default.Schema({
    id: { type: String, default: (0, uuid_1.v4)() },
    name: { type: String },
    price: { type: Number },
    video_quality: { type: String },
    resolution: { type: String },
    support_devices: { type: String },
    order: { type: Number },
}, { timestamps: true, versionKey: false });
exports.default = mongoose_1.default.model('plans', Plan);
//# sourceMappingURL=plan.js.map