/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, NextFunction } from 'express';
import Joi, { ValidationErrorItem } from 'joi';
import { ResponseObj } from '../createResponse';
import HttpException from '../../exceptions/HttpException';

const schema = Joi.object({
  start_lat: Joi.number()
    .min(-90)
    .max(90)
    .message('Start latitude must be between -90 - 90'),
  start_long: Joi.number()
    .min(-180)
    .max(180)
    .message('Start longitude and longitude must be between -180 to 180'),
  end_lat: Joi.number()
    .min(-90)
    .max(90)
    .message('End latitude must be between -90 - 90'),
  end_long: Joi.number()
    .min(-180)
    .max(180)
    .message('End longitude and longitude must be between -180 to 180'),
  rider_name: Joi.string().min(1),
  driver_name: Joi.string().min(1),
  driver_vehicle: Joi.string().min(1),
});

const ridesInputValidator = (
  req: Request,
  res: ResponseObj,
  next: NextFunction
): void => {
  try {
    const { error } = schema.validate(req.body);
    if (error) {
      throw error;
    } else {
      next();
    }
  } catch (err) {
    // console.log('zzzzzzzzzzzzz', err);
    const { details } = err;
    const messages = details
      .map((error: ValidationErrorItem) => error.message)
      .join(', ');
    next(new HttpException(messages, 400));
  }
};

export default ridesInputValidator;
