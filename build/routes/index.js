"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const movie_1 = __importDefault(require("./movie"));
const trending_1 = __importDefault(require("./trending"));
const tv_1 = __importDefault(require("./tv"));
const search_1 = __importDefault(require("./search"));
const discover_1 = __importDefault(require("./discover"));
const genre_1 = __importDefault(require("./genre"));
const country_1 = __importDefault(require("./country"));
const year_1 = __importDefault(require("./year"));
const sortby_1 = __importDefault(require("./sortby"));
const list_1 = __importDefault(require("./list"));
const history_1 = __importDefault(require("./history"));
const auth_1 = __importDefault(require("./auth"));
const credit_1 = __importDefault(require("./credit"));
const video_1 = __importDefault(require("./video"));
const image_1 = __importDefault(require("./image"));
const similar_1 = __importDefault(require("./similar"));
const plan_1 = __importDefault(require("./plan"));
const rating_1 = __importDefault(require("./rating"));
const comment_1 = __importDefault(require("./comment"));
const ranking_1 = __importDefault(require("./ranking"));
const updateView_1 = __importDefault(require("./updateView"));
const account_1 = __importDefault(require("./account"));
const errorController_1 = __importDefault(require("@/controllers/errorController"));
function route(app) {
    app.use('/auth', auth_1.default);
    app.use('/account', account_1.default);
    app.use('/movie', movie_1.default);
    app.use('/tv', tv_1.default);
    app.use('/search', search_1.default);
    app.use('/discover', discover_1.default);
    app.use('/trending', trending_1.default);
    app.use('/genre', genre_1.default);
    app.use('/country', country_1.default);
    app.use('/year', year_1.default);
    app.use('/sortby', sortby_1.default);
    app.use('/list', list_1.default);
    app.use('/history', history_1.default);
    app.use('/credits', credit_1.default);
    app.use('/videos', video_1.default);
    app.use('/images', image_1.default);
    app.use('/similar', similar_1.default);
    app.use('/plan', plan_1.default);
    app.use('/rating', rating_1.default);
    app.use('/comment', comment_1.default);
    app.use('/ranking', ranking_1.default);
    app.use('/update-view', updateView_1.default);
    app.all('*', (req, res, next) => {
        return next((0, http_errors_1.default)(404, `Can't find the route: ${req.originalUrl} on server!`));
    });
    app.use(errorController_1.default);
}
exports.default = route;
//# sourceMappingURL=index.js.map