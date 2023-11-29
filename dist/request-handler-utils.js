"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondJson = void 0;
const respondJson = (data) => {
    return (_req, res, _next) => {
        res.json(data);
    };
};
exports.respondJson = respondJson;
//# sourceMappingURL=request-handler-utils.js.map