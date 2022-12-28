"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getUserId = (authToken) => {
    if (authToken === "" || authToken == undefined) {
        return {
            userAuthenticated: false,
            userId: "",
            error: "authToken is undefined",
        };
    }
    let JWT_SECRET = process.env.JWT_SECRET;
    if (JWT_SECRET == undefined) {
        return {
            userAuthenticated: false,
            userId: "",
            error: "can not verify token",
        };
    }
    try {
        const token = authToken.replace("Bearer ", "");
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return {
            userAuthenticated: true,
            userId: payload.userId,
            error: "",
        };
    }
    catch (e) {
        return {
            userAuthenticated: false,
            userId: "",
            error: e,
        };
    }
};
exports.default = getUserId;
