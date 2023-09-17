"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const account_1 = __importDefault(require("@/models/account"));
const jwtRedis_1 = __importDefault(require("@/utils/jwtRedis"));
const generateOTP_1 = __importDefault(require("@/utils/generateOTP"));
const sendinblueEmail_1 = __importDefault(require("@/utils/sendinblueEmail"));
class AccountController {
    constructor() {
        jwtRedis_1.default.setPrefix('user_logout');
    }
    async verify(req, res, next) {
        try {
            const user_token = req.headers.authorization.replace('Bearer ', '');
            const user = jsonwebtoken_1.default.verify(user_token, process.env.JWT_SIGNATURE_SECRET, {
                algorithms: ['HS256'],
            });
            const formUser = req.body;
            const isAlive = await jwtRedis_1.default.verify(user_token);
            if (!isAlive) {
                return res.json({
                    isTokenAlive: false,
                    result: 'Token is no longer active',
                });
            }
            const OTP = (0, generateOTP_1.default)({ length: 6 });
            let encoded = '';
            let emailResponse = null;
            switch (req.params.type) {
                case 'email':
                    encoded = jsonwebtoken_1.default.sign({
                        id: user.id,
                        email: user.email,
                        auth_type: 'email',
                        description: 'Verify your Email',
                        exp: Math.floor(Date.now() / 1000) +
                            +process.env.OTP_EXP_OFFSET * 60,
                    }, OTP, {
                        algorithm: 'HS256',
                        // expiresIn: +process.env.OTP_EXP_OFFSET! * 60,
                    });
                    emailResponse = await sendinblueEmail_1.default.VerificationOTP({
                        to: formUser.email,
                        otp: OTP,
                        noteExp: +process.env.OTP_EXP_OFFSET,
                    });
                    break;
                case 'change-password':
                    const account = account_1.default.findOne({
                        email: user.email,
                        auth_type: 'email',
                        password: formUser.old_password,
                    });
                    if (account != null) {
                        encoded = jsonwebtoken_1.default.sign({
                            id: user.id,
                            email: user.email,
                            auth_type: 'email',
                            old_password: formUser.old_password,
                            new_password: formUser.new_password,
                            description: 'Change your password',
                            exp: Math.floor(Date.now() / 1000) +
                                +process.env.OTP_EXP_OFFSET * 60,
                        }, OTP, {
                            algorithm: 'HS256',
                        });
                        emailResponse = await sendinblueEmail_1.default.VerificationOTP({
                            to: formUser.email,
                            otp: OTP,
                            title: 'Xác nhận thay đổi mật khẩu của bạn',
                            noteExp: +process.env.OTP_EXP_OFFSET,
                        });
                    }
                    else {
                        return res.json({
                            isWrongPassword: true,
                            result: 'Wrong password',
                        });
                    }
                    break;
                case 'change-email':
                    encoded = jsonwebtoken_1.default.sign({
                        id: user.id,
                        email: user.email,
                        auth_type: 'email',
                        description: 'Change your Email',
                        exp: Math.floor(Date.now() / 1000) +
                            +process.env.OTP_EXP_OFFSET * 60,
                    }, OTP, {
                        algorithm: 'HS256',
                    });
                    emailResponse = await sendinblueEmail_1.default.VerificationOTP({
                        to: formUser.email,
                        otp: OTP,
                        title: 'Xác nhận thay đổi Email của bạn',
                        noteExp: +process.env.OTP_EXP_OFFSET,
                    });
                    break;
                default:
                    return next(http_errors_1.default.NotFound(`Verify account with type ${req.params.type} not found`));
                    break;
            }
            if (encoded.length == 0) {
                return next(http_errors_1.default.InternalServerError(`Verify account failed`));
            }
            else {
                res.set('Access-Control-Expose-Headers', 'Authorization');
                res.header('Authorization', encoded).json({
                    isSended: true,
                    exp_offset: +process.env.OTP_EXP_OFFSET * 60,
                    result: 'Send otp email successfully',
                });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            const user_token = req.headers.authorization.replace('Bearer ', '');
            const user = jsonwebtoken_1.default.verify(user_token, req.body.otp, {
                algorithms: ['HS256'],
            });
            const isAlive = await jwtRedis_1.default.verify(user_token);
            if (!isAlive) {
                return res.json({
                    isTokenAlive: false,
                    result: 'Token is no longer active',
                });
            }
            const result = await account_1.default.updateOne({
                id: user.id,
                email: user.email,
                auth_type: 'email',
                password: user.old_password,
            }, {
                $set: {
                    password: user.new_password,
                },
            });
            if (result.modifiedCount == 1) {
                res.json({ success: true, result: 'Change password successfully' });
            }
            else {
                res.json({ success: false, result: 'Change password failed' });
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
    async changeEmail(req, res, next) {
        try {
            const user_token = req.headers.authorization.replace('Bearer ', '');
            const formUser = req.body;
            const user = jsonwebtoken_1.default.verify(user_token, formUser.otp, {
                algorithms: ['HS256'],
            });
            const isAlive = await jwtRedis_1.default.verify(user_token);
            if (!isAlive) {
                return res.json({
                    isTokenAlive: false,
                    result: 'Token is no longer active',
                });
            }
            const result = await account_1.default.updateOne({
                id: user.id,
                email: user.email,
                auth_type: 'email',
            }, {
                $set: {
                    email: formUser.new_email,
                },
            });
            if (result.modifiedCount == 1) {
                res.json({ success: true });
            }
            else {
                res.json({
                    success: false,
                });
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
}
exports.default = new AccountController();
//# sourceMappingURL=accountController.js.map