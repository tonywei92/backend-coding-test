/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

export type ResponseShape = {
  status: string;
  data: any;
  message: string;
};

export interface ResponseObj extends Response {
  createResponse: (
    data: any,
    status?: string,
    message?: string
  ) => ResponseShape;
}

export const createResponse = (
  data: any,
  status = 'success',
  message = ''
): ResponseShape => {
  return {
    status,
    data,
    message,
  };
};

const createResponseMiddleware = (
  req: Request,
  res: ResponseObj,
  next: NextFunction
): any => {
  res.createResponse = createResponse;
  next();
};

export default createResponseMiddleware;
