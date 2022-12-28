"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mustAuth = void 0;
const getUserId_1 = __importDefault(require("./getUserId"));
// mustAuth is used to ensure that the user is authenticated
// if the token is undefined or empty string it is going to
// throw an error
//
// also if the authentication process failed it is going
// to throw an error with the message from getUserId func
const mustAuth = (authToken) => {
    if (authToken == undefined || authToken == "") {
        throw new Error("Authentication Required");
    }
    const userAuth = (0, getUserId_1.default)(authToken);
    if (!userAuth.userAuthenticated) {
        throw new Error(userAuth.error);
    }
    return userAuth;
};
exports.mustAuth = mustAuth;
