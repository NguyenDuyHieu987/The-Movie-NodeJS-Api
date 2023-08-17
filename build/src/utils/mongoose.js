"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongooseToObject = exports.multipleMongooseToObject = void 0;
function multipleMongooseToObject(data) {
    return data.map((item) => item.toObject());
}
exports.multipleMongooseToObject = multipleMongooseToObject;
function mongooseToObject(data) {
    return data.toObject();
}
exports.mongooseToObject = mongooseToObject;
//# sourceMappingURL=mongoose.js.map