import { RequestHandler } from 'express';

export const respondJson = (data: Record<string, unknown>, status?: number): RequestHandler => {
  return (_req, res, _next) => {
    if (status) {
      res.status(status);
    }
    res.json(data);
  };
};
