"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDummyServer = void 0;
const express = require("express");
const response_logger_middleware_1 = require("./response-logger-middleware");
const createDummyServer = async (registerEndpoints, options) => {
    const logger = options?.logger || console;
    const app = express();
    app.use(express.json());
    const requestStore = new Map();
    app.use((req, _res, next) => {
        const reqSnapArr = requestStore.get(req.originalUrl) || [];
        reqSnapArr.push({
            method: req.method,
            params: req.params,
            query: req.query,
            body: req.body,
            headers: req.headers,
        });
        requestStore.set(req.originalUrl, reqSnapArr);
        if (options?.debug) {
            logger.debug(`[Request] ${req.method} ${req.originalUrl}`, {
                body: req.body,
                query: req.query,
                headers: req.headers,
            });
        }
        next();
    });
    app.use((0, response_logger_middleware_1.createResponseLogger)(options));
    await registerEndpoints(app);
    const server = app.listen(0);
    const { port } = server.address();
    const url = `http://localhost:${port}`;
    const close = () => {
        server.close();
    };
    return { url, close, requestStore };
};
exports.createDummyServer = createDummyServer;
//# sourceMappingURL=DummyServer.js.map