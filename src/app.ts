import express, { Express, Request, NextFunction } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { Database } from 'sqlite3';
import { loggerStream } from './logger';
import errorHandlerMiddleware from './middlewares/errorHandler';
import createResponseMiddleware, {
  ResponseObj,
} from './middlewares/createResponse';
import RidesInputValidator from './middlewares/validators/ridesInput';
import HttpException from './exceptions/HttpException';
import RideRepositoryBuilder from './repositories/Ride';

const appRouter = (db: Database): Express => {
  const RideRepository = RideRepositoryBuilder(db);

  const app = express();
  app.use(morgan('combined', { stream: loggerStream }));
  app.use(createResponseMiddleware);
  const jsonParser = bodyParser.json();
  app.get('/health', (req, res) => res.send('Healthy'));

  app.post(
    '/rides',
    [jsonParser, RidesInputValidator],
    async (req: Request, res: ResponseObj, next: NextFunction) => {
      const {
        start_lat: startLat,
        start_long: startLong,
        end_lat: endLat,
        end_long: endLong,
        rider_name: riderName,
        driver_name: driverName,
        driver_vehicle: driverVehicle,
      } = req.body;
      const values = {
        startLat,
        startLong,
        endLat,
        endLong,
        riderName,
        driverName,
        driverVehicle,
      };
      try {
        const lastId = await RideRepository.insert(values);
        const rows = await RideRepository.findById(lastId);
        res.status(201).json(res.createResponse(rows));
      } catch (err) {
        next(new HttpException(err.message));
      }
    }
  );

  app.get('/rides', async (req, res: ResponseObj, next: NextFunction) => {
    const perPage = 10;

    const { page = 1 } = req.query;

    try {
      const allData = await RideRepository.all(Number(page), perPage);
      const response = res.createResponse(allData.rows);
      response.page = Number(page);
      response.itemsCount = Number(allData.count);
      response.lastPage = Math.ceil(Number(allData.count) / 10);
      res.json(response);
    } catch (err) {
      return next(new HttpException(err.message));
    }
  });

  app.get('/rides/:id', async (req, res: ResponseObj, next: NextFunction) => {
    const { id } = req.params;
    try {
      const result = await RideRepository.findById(Number(id));
      if (result.length === 0) {
        return next(new HttpException('Could not find any rides', 404));
      }
      res.json(res.createResponse(result));
    } catch (err) {
      next(new HttpException(err.message));
    }
  });

  app.use(errorHandlerMiddleware);
  return app;
};

export default appRouter;
