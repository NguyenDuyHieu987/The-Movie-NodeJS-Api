"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const list_1 = __importDefault(require("@/models/list"));
const WatchList_1 = __importDefault(require("@/models/WatchList"));
const account_1 = __importDefault(require("@/models/account"));
class AuthController {
    async login(req, res, next) {
        try {
            const account = await account_1.default.findOne({
                email: req.body.email,
                auth_type: 'email',
            });
            if (account != null) {
                if (account.password == req.body.password) {
                    const encoded = jsonwebtoken_1.default.sign({
                        id: account.id,
                        username: account.username,
                        password: account.password,
                        full_name: account.full_name,
                        avatar: account.avatar,
                        role: account.role,
                        email: account.email,
                        auth_type: account.auth_type,
                        created_at: account.created_at,
                        exp: Math.floor(Date.now() / 1000) + +process.env.JWT_EXP_OFFSET,
                    }, process.env.JWT_SIGNATURE_SECRET, { algorithm: 'HS256' });
                    res.set('Access-Control-Expose-Headers', 'Authorization');
                    return res.header('Authorization', encoded).json({
                        isLogin: true,
                        exp_token_hours: process.env.JWT_EXP_OFFSET,
                        result: {
                            id: account.id,
                            username: account.username,
                            full_name: account.full_name,
                            avatar: account.avatar,
                            email: account.email,
                            auth_type: account.auth_type,
                            role: account.role,
                            created_at: account.created_at,
                        },
                    });
                }
                else {
                    return res.json({ isWrongPassword: true, result: 'Wrong Password' });
                }
            }
            else {
                return res.json({
                    isNotExist: true,
                    result: 'Account does not exists',
                });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async loginFacebook(req, res, next) {
        try {
            const account = await account_1.default.findOne({
                email: req.body.email,
                auth_type: 'email',
            });
            if (account != null) {
                if (account.password == req.body.password) {
                    const encoded = jsonwebtoken_1.default.sign({
                        id: account.id,
                        username: account.username,
                        password: account.password,
                        full_name: account.full_name,
                        avatar: account.avatar,
                        role: account.role,
                        email: account.email,
                        auth_type: account.auth_type,
                        created_at: account.created_at,
                        exp: Math.floor(Date.now() / 1000) + +process.env.JWT_EXP_OFFSET,
                    }, process.env.JWT_SIGNATURE_SECRET, { algorithm: 'HS256' });
                    res.set('Access-Control-Expose-Headers', 'Authorization');
                    res.header('Authorization', encoded).json({
                        isLogin: true,
                        exp_token_hours: process.env.JWT_EXP_OFFSET,
                        result: {
                            id: account.id,
                            username: account.username,
                            full_name: account.full_name,
                            avatar: account.avatar,
                            email: account.email,
                            auth_type: account.auth_type,
                            role: account.role,
                            created_at: account.created_at,
                        },
                    });
                }
                else {
                    res.json({ isWrongPassword: true, result: 'Wrong Password' });
                }
            }
            else {
                res.json({ isNotExist: true, result: 'Account does not exists' });
            }
        }
        catch (error) {
            next(error);
        }
    }
    signup(req, res, next) {
        try {
            account_1.default.find({
                email: req.body.email,
            })
                .then((dataAccount) => {
                if (dataAccount.length == 0) {
                    const formData = req.body;
                    const account = new account_1.default(formData);
                    account.save();
                    const list = new list_1.default({
                        created_by: req.body.user_name,
                        description: 'List which users are added',
                        favorite_count: 0,
                        id: req.body.id,
                        items: [],
                        iso_639_1: 'en',
                        name: 'List',
                        poster_path: null,
                    });
                    list.save();
                    const watchList = new WatchList_1.default({
                        created_by: req.body.user_name,
                        description: 'Videos which users played',
                        favorite_count: 0,
                        id: req.body.id,
                        item_count: 0,
                        iso_639_1: 'en',
                        name: 'WatchList',
                        poster_path: null,
                        results: [],
                    });
                    watchList.save();
                    res.json({ isSignUp: true, result: 'Sign up successfully' });
                }
                else {
                    res.json({ isSignUp: false, result: 'Email already exist' });
                }
            })
                .catch((error) => {
                next(error);
            });
        }
        catch (error) {
            next(error);
        }
    }
    getUserByUserToken(req, res, next) {
        try {
            account_1.default.findOne({
                user_token: req.body.user_token,
            })
                .then((dataAccount) => {
                res.json({
                    isLogin: true,
                    result: {
                        id: dataAccount.id,
                        user_name: dataAccount.user_name,
                        full_name: dataAccount.created_by,
                        avatar: dataAccount.avatar,
                        email: dataAccount.email,
                        user_token: dataAccount.user_token,
                    },
                });
            })
                .catch((error) => {
                res.json({ isLogin: false, result: 'Invalid token' });
                next(error);
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new AuthController();
//# sourceMappingURL=authController.js.map