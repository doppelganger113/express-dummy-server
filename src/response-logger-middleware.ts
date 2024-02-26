import {DummyServerOptions} from "./DummyServerOptions";
import {RequestHandler} from "express";

export const createResponseLogger = (options?: DummyServerOptions): RequestHandler => {
    if (!options?.debug) {
        return (req, res, next) => next();
    }

    const logger = options.logger || console;

    return function logResponseBody(req, res, next) {
        const oldWrite = res.write;
        const oldEnd = res.end;

        const chunks: any[] = [];

        res.write = function (chunk) {
            chunks.push(chunk);

            // @ts-ignore
            return oldWrite.apply(res, arguments);
        };

        // @ts-ignore
        res.end = function (chunk) {
            if (chunk) {
                chunks.push(chunk);
            }

            let body: string;

            if(Buffer.isBuffer(chunks)) {
                body = Buffer.concat(chunks).toString('utf8')
            } else if(Array.isArray(chunks)) {
                body = chunks.toString();
            } else {
                body = chunks;
            }

            let parsedBody = body;
            try {
                parsedBody = JSON.parse(body);
            } catch (err) {
            }

            logger.debug(`[Response](${res.statusCode}) ${req.method} ${req.originalUrl}`, {
                body: parsedBody,
                headers: {
                    ...res.getHeaders()
                }
            })

            // @ts-ignore
            oldEnd.apply(res, arguments);
        };

        next();
    }
}