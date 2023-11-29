import * as express from "express";
import {Express, RequestHandler} from "express";
import {AddressInfo} from "net";
import {DummyServerOptions} from "./DummyServerOptions";

export interface RequestSnapshot {
    method: string;
    params: Record<string, unknown>;
    query: Record<string, unknown>;
    body?: unknown;
    headers: Record<string, unknown>;
}

export interface DummyServer {
    url: string;
    close: () => void
    requestStore: Map<string, RequestSnapshot[]>
}

const createResponseLogger = (options?: DummyServerOptions): RequestHandler => {
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
            if (chunk)
                chunks.push(chunk);

            const body = Buffer.concat(chunks).toString('utf8');


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

export const createDummyServer = async (
    registerEndpoints: (app: Express) => Promise<void>,
    options?: DummyServerOptions
): Promise<DummyServer> => {
    const logger = options?.logger || console;

    const app = express();
    app.use(express.json());

    const requestStore = new Map<string, RequestSnapshot[]>();
    app.use((req, res, next) => {
        const reqSnapArr = requestStore.get(req.originalUrl) || [];
        reqSnapArr.push({
            method: req.method,
            params: req.params,
            query: req.query,
            body: req.body,
            headers: req.headers
        });
        requestStore.set(req.originalUrl, reqSnapArr);

        if (options?.debug) {
            logger.debug(`[Request] ${req.method} ${req.originalUrl}`, {
                body: req.body,
                query: req.query,
                headers: req.headers
            });
        }

        next();
    });

    app.use(createResponseLogger(options));

    await registerEndpoints(app);

    const server = app.listen(0);
    const {port} = server.address() as AddressInfo;
    const url = `http://localhost:${port}`;

    const close = (): void => {
        server.close();
    }

    return {url, close, requestStore};
}
