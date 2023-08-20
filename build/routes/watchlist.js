"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const WatchListController_1 = __importDefault(require("../controllers/WatchListController"));
const router = express_1.default.Router();
// router.get('/:slug', tvController.detail);
router.get('/:accountid/:slug', WatchListController_1.default.index);
router.post('/:slug', WatchListController_1.default.handleWatchList);
exports.default = router;
//# sourceMappingURL=watchlist.js.map