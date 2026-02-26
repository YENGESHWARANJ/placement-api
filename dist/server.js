"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const db_config_1 = __importDefault(require("./config/db.config"));
const socket_config_1 = require("./config/socket.config");
const PORT = process.env.PORT || 5000;
const httpServer = (0, http_1.createServer)(app_1.default);
(0, socket_config_1.initSocket)(httpServer);
(async () => {
    await (0, db_config_1.default)();
    httpServer.listen(PORT, () => {
        console.log(`🚀 Backend running on port ${PORT} with WebSockets`);
    });
})();
