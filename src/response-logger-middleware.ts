import { DummyServerOptions } from './DummyServerOptions';
import { RequestHandler } from 'express';

export const createResponseLogger = (options?: DummyServerOptions): RequestHandler => {
  if (!options?.debug) {
    return (_req, _res, next) => next();
  }

  const logger = options.logger || console;

  return function logResponseBody(req, res, next) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const oldWrite = res.write;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const oldEnd = res.end;

    const chunks: Buffer | unknown[] | string = [];

    res.write = function (chunk) {
      chunks.push(chunk);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      // eslint-disable-next-line prefer-rest-params
      return oldWrite.apply(res, arguments);
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    res.end = function (chunk) {
      if (chunk) {
        chunks.push(chunk);
      }

      let body: string;

      if (Buffer.isBuffer(chunks)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        body = Buffer.concat(chunks).toString('utf8');
      } else if (Array.isArray(chunks)) {
        body = chunks.toString();
      } else {
        body = chunks;
      }

      let parsedBody = body;
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        parsedBody = JSON.parse(body);
      } catch (err) {
        /* empty */
      }

      logger.debug(`[Response](${res.statusCode}) ${req.method} ${req.originalUrl}`, {
        body: parsedBody,
        headers: {
          ...res.getHeaders(),
        },
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      // eslint-disable-next-line prefer-rest-params
      oldEnd.apply(res, arguments);
    };

    next();
  };
};
