"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const http_errors_1 = __importDefault(require("http-errors"));
const account_1 = __importDefault(require("@/models/account"));
const sendinblueEmail_1 = __importDefault(require("@/utils/sendinblueEmail"));
const generateOTP_1 = __importDefault(require("@/utils/generateOTP"));
const jwtRedis_1 = __importDefault(require("@/utils/jwtRedis"));
const EmailValidation_1 = __importDefault(require("@/utils/EmailValidation"));
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
                        email: account.email,
                        full_name: account.full_name,
                        avatar: account.avatar,
                        role: account.role,
                        auth_type: account.auth_type,
                        created_at: account.created_at,
                        exp: Math.floor(Date.now() / 1000) + +process.env.JWT_EXP_OFFSET,
                    }, process.env.JWT_SIGNATURE_SECRET, { algorithm: 'HS256' });
                    res.set('Access-Control-Expose-Headers', 'Authorization');
                    return res.header('Authorization', encoded).json({
                        isLogin: true,
                        exp_token_hours: +process.env.JWT_EXP_OFFSET,
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
            const accessToken = req.headers.authorization.replace('Bearer ', '');
            const facebookUser = await (0, node_fetch_1.default)(`https://graph.facebook.com/v15.0/me?access_token=${accessToken}&fields=id,name,email,picture`).then((response) => response.json());
            const account = await account_1.default.findOne({ id: facebookUser.id });
            if (account == null) {
                account_1.default.collection.insertOne({
                    id: facebookUser.id,
                    username: facebookUser.name,
                    full_name: facebookUser.name,
                    avatar: facebookUser.picture.data.url,
                    email: facebookUser.email,
                    auth_type: 'facebook',
                    role: 'normal',
                    created_at: Date.now(),
                    updated_at: Date.now(),
                });
                const newAccount = await account_1.default.findOne({
                    id: facebookUser.id,
                });
                if (newAccount != null) {
                    const encoded = jsonwebtoken_1.default.sign({
                        id: newAccount.id,
                        username: newAccount.username,
                        email: newAccount.email,
                        full_name: newAccount.full_name,
                        avatar: newAccount.avatar,
                        role: newAccount.role,
                        auth_type: newAccount.auth_type,
                        created_at: newAccount.created_at,
                        exp: Math.floor(Date.now() / 1000) + +process.env.JWT_EXP_OFFSET,
                    }, process.env.JWT_SIGNATURE_SECRET, { algorithm: 'HS256' });
                    res.set('Access-Control-Expose-Headers', 'Authorization');
                    return res.header('Authorization', encoded).json({
                        isSignUp: true,
                        exp_token_hours: +process.env.JWT_EXP_OFFSET,
                        result: {
                            id: newAccount.id,
                            username: newAccount.username,
                            full_name: newAccount.full_name,
                            avatar: newAccount.avatar,
                            email: newAccount.email,
                            auth_type: newAccount.auth_type,
                            role: newAccount.role,
                            created_at: newAccount.created_at,
                        },
                    });
                }
                else {
                    return res.json({
                        isLogin: false,
                        result: 'Login Facebook failed!',
                    });
                }
            }
            else {
                const accountLogedIn = await account_1.default.findOneAndUpdate({ id: facebookUser.id }, {
                    $set: {
                        avatar: facebookUser.picture.data.url,
                    },
                }, { returnDocument: 'after' });
                if (accountLogedIn != null) {
                    const encoded = jsonwebtoken_1.default.sign({
                        id: accountLogedIn.id,
                        username: accountLogedIn.username,
                        email: accountLogedIn.email,
                        full_name: accountLogedIn.full_name,
                        avatar: accountLogedIn.avatar,
                        role: accountLogedIn.role,
                        auth_type: accountLogedIn.auth_type,
                        created_at: accountLogedIn.created_at,
                        exp: Math.floor(Date.now() / 1000) + +process.env.JWT_EXP_OFFSET,
                    }, process.env.JWT_SIGNATURE_SECRET, { algorithm: 'HS256' });
                    res.set('Access-Control-Expose-Headers', 'Authorization');
                    return res.header('Authorization', encoded).json({
                        isLogin: true,
                        exp_token_hours: +process.env.JWT_EXP_OFFSET,
                        result: {
                            id: accountLogedIn.id,
                            username: accountLogedIn.username,
                            full_name: accountLogedIn.full_name,
                            avatar: accountLogedIn.avatar,
                            email: accountLogedIn.email,
                            auth_type: accountLogedIn.auth_type,
                            role: accountLogedIn.role,
                            created_at: accountLogedIn.created_at,
                        },
                    });
                }
                else {
                    return res.json({
                        isLogin: false,
                        result: 'Login Facebook failed!',
                    });
                }
            }
        }
        catch (error) {
            next(error);
        }
    }
    async loginGoogle(req, res, next) {
        try {
            const accessToken = req.headers.authorization.replace('Bearer ', '');
            const googleUser = await (0, node_fetch_1.default)(`https://www.googleapis.com/oauth2/v3/userinfo`, {
                headers: { Authorization: accessToken },
            }).then((response) => response.json());
            const account = await account_1.default.findOne({ id: googleUser.sub });
            if (account == null) {
                account_1.default.collection.insertOne({
                    id: googleUser.sub,
                    username: googleUser.name,
                    full_name: googleUser.name,
                    avatar: googleUser.picture,
                    email: googleUser.email,
                    auth_type: 'google',
                    role: 'normal',
                    created_at: Date.now(),
                    updated_at: Date.now(),
                });
                const newAccount = await account_1.default.findOne({
                    id: googleUser.sub,
                });
                if (newAccount != null) {
                    const encoded = jsonwebtoken_1.default.sign({
                        id: newAccount.id,
                        username: newAccount.username,
                        email: newAccount.email,
                        full_name: newAccount.full_name,
                        avatar: newAccount.avatar,
                        role: newAccount.role,
                        auth_type: newAccount.auth_type,
                        created_at: newAccount.created_at,
                        exp: Math.floor(Date.now() / 1000) + +process.env.JWT_EXP_OFFSET,
                    }, process.env.JWT_SIGNATURE_SECRET, { algorithm: 'HS256' });
                    res.set('Access-Control-Expose-Headers', 'Authorization');
                    return res.header('Authorization', encoded).json({
                        isSignUp: true,
                        exp_token_hours: +process.env.JWT_EXP_OFFSET,
                        result: {
                            id: newAccount.id,
                            username: newAccount.username,
                            full_name: newAccount.full_name,
                            avatar: newAccount.avatar,
                            email: newAccount.email,
                            auth_type: newAccount.auth_type,
                            role: newAccount.role,
                            created_at: newAccount.created_at,
                        },
                    });
                }
                else {
                    return res.json({
                        isLogin: false,
                        result: 'Login Google failed!',
                    });
                }
            }
            else {
                const encoded = jsonwebtoken_1.default.sign({
                    id: account.id,
                    username: account.username,
                    email: account.email,
                    full_name: account.full_name,
                    avatar: account.avatar,
                    role: account.role,
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
        }
        catch (error) {
            next(error);
        }
    }
    async getUserByToken(req, res, next) {
        try {
            const user_token = req.headers.authorization.replace('Bearer ', '');
            const user = jsonwebtoken_1.default.verify(user_token, process.env.JWT_SIGNATURE_SECRET, {
                algorithms: ['HS256'],
            });
            const isAlive = await jwtRedis_1.default.verify(user_token);
            if (isAlive) {
                res.set('Access-Control-Expose-Headers', 'Authorization');
                return res.header('Authorization', user_token).json({
                    isLogin: true,
                    result: {
                        id: user.id,
                        username: user.username,
                        full_name: user.full_name,
                        avatar: user.avatar,
                        email: user.email,
                        auth_type: user.auth_type,
                        role: user.role,
                        created_at: user.created_at,
                    },
                });
            }
            else {
                res.json({ isLogin: false, result: 'Token is no longer active' });
            }
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                return res.json({ isTokenExpired: true, result: 'Token is expired' });
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return res.json({ isInvalidToken: true, result: 'Token is invalid' });
            }
            next(error);
        }
    }
    async signup(req, res, next) {
        try {
            const user_token = req.headers.authorization.replace('Bearer ', '');
            const user = jsonwebtoken_1.default.verify(user_token, req.body.otp, {
                algorithms: ['HS256'],
            });
            const account = await account_1.default.findOne({
                id: user.id,
                auth_type: 'email',
            });
            if (account == null) {
                account_1.default.collection.insertOne({
                    id: user.id,
                    username: user.username,
                    password: user.password,
                    full_name: user.full_name,
                    avatar: user.avatar,
                    email: user.email,
                    auth_type: user.auth_type,
                    role: user.role,
                    created_at: Date.now(),
                    updated_at: Date.now(),
                });
                res.json({
                    isSignUp: true,
                    result: 'Sign up account successfully',
                });
            }
            else {
                res.json({ isAccountExist: true, result: 'Account is already exists' });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async signup_verify(req, res, next) {
        try {
            const formUser = req.body;
            switch (req.params.type) {
                case 'email':
                    const account = await account_1.default.findOne({
                        email: formUser.email,
                        auth_type: 'email',
                    });
                    if (account == null) {
                        if ((0, EmailValidation_1.default)(formUser.email)) {
                            // if (true) {
                            const OTP = (0, generateOTP_1.default)({ length: 6 });
                            const encoded = jsonwebtoken_1.default.sign({
                                id: formUser.id,
                                username: formUser.username,
                                password: formUser.password,
                                email: formUser.email,
                                full_name: formUser.full_name,
                                avatar: formUser.avatar,
                                role: 'normal',
                                auth_type: 'email',
                                description: 'Register new account',
                                exp: Math.floor(Date.now() / 1000) +
                                    +process.env.JWT_EXP_OFFSET,
                            }, OTP, { algorithm: 'HS256' });
                            const emailResponse = await sendinblueEmail_1.default.SendEmail({
                                to: formUser.email,
                                otp: OTP,
                                title: 'Xác nhận đăng ký tài khoản',
                                noteExp: +process.env.OTP_EXP_OFFSET,
                            });
                            // console.log(emailResponse);
                            res.set('Access-Control-Expose-Headers', 'Authorization');
                            res.header('Authorization', encoded).json({ success: true });
                        }
                        else {
                            res.json({
                                isInValidEmail: true,
                                result: 'Email is Invalid',
                            });
                        }
                    }
                    else {
                        res.json({
                            isEmailExist: true,
                            result: 'Email is already exists',
                        });
                    }
                    break;
                default:
                    next(http_errors_1.default.NotFound(`Verify sign up with type: ${req.params.type} is not found!`));
                    break;
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new AuthController();
//# sourceMappingURL=authController.js.map