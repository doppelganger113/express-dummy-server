"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondJson = void 0;
const respondJson = (data, status) => {
    return (_req, res, _next) => {
        if (status) {
            res.status(status);
        }
        res.json(data);
    };
};
exports.respondJson = respondJson;
//# sourceMappingURL=request-handler-utils.js.map