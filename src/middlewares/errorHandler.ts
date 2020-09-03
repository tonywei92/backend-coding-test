/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, NextFunction } from 'express';
import { ResponseObj } from './createResponse';
import HttpException from '../exceptions/HttpException';
import logger from '../logger';

const errorHandler = (
  err: HttpException,
  req: Request,
  res: ResponseObj,
  next: NextFunction
): void => {
  logger.error(err);
  res
    .status(err.code || 500)
    .json(res.createResponse(null, 'error', err.message));
};

export default errorHandler;
