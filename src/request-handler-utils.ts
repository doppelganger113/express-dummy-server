import {RequestHandler} from "express";

export const respondJson = (data: Record<string, any>): RequestHandler => {
    return (_req, res, _next) => {
        res.json(data);
    }
}