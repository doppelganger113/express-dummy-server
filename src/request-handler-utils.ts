import {RequestHandler} from "express";
import * as console from "console";

export const respondJson = (data: Record<string, any>): RequestHandler => {
    return (_req, res, _next) => {
        res.json(data);
    }
}

function byPowerOfTwo(val: number): number {
    return val * 2;
}

[1, 2, 3]
    .map(byPowerOfTwo)
    .forEach((val, index, arr) => {
        console.log(val);
    });
