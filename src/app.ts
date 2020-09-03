import express, { Express, Request, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { Database } from 'sqlite3';
import errorHandlerMiddleware from './middlewares/errorHandler';
import createResponseMiddleware, {
  ResponseObj,
} from './middlewares/createResponse';
import RidesInputValidator from './middlewares/validators/ridesInput';
import HttpException from './exceptions/HttpException';

const appRouter = (db: Database): Express => {
  const app = express();
  app.use(createResponseMiddleware);
  const jsonParser = bodyParser.json();
  app.get('/health', (req, res) => res.send('Healthy'));

  app.post(
    '/rides',
    [jsonParser, RidesInputValidator],
    (req: Request, res: ResponseObj, next: NextFunction) => {
      const {
        start_lat: startLat,
        start_long: startLong,
        end_lat: endLat,
        end_long: endLong,
        rider_name: riderName,
        driver_name: driverName,
        driver_vehicle: driverVehicle,
      } = req.body;
      const values = [
        startLat,
        startLong,
        endLat,
        endLong,
        riderName,
        driverName,
        driverVehicle,
      ];

      db.run(
        'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
        values,
        function dbCb(err) {
          if (err) {
            return next(new HttpException(err.message));
          }

          db.all(
            'SELECT * FROM Rides WHERE rideID = ?',
            this.lastID,
            function dbCbAll(error, rows) {
              if (error) {
                return next(new HttpException(err.message));
              }
              res.status(201).json(res.createResponse(rows));
            }
          );
        }
      );
    }
  );

  app.get('/rides', (req, res: ResponseObj, next: NextFunction) => {
    const perPage = 10;

    const { page = 1 } = req.query;
    db.all(
      `SELECT * FROM Rides LIMIT ${perPage} OFFSET ${
        perPage * (Number(page) - 1)
      }`,
      function dbCb(err, rows) {
        if (err) {
          return next(new HttpException(err.message));
        }
        db.all('SELECT count(*) as total FROM Rides', function dbCb2(
          err2,
          rows2
        ) {
          if (err) {
            return next(new HttpException(err2.message));
          }
          const response = res.createResponse(rows);
          response.page = Number(page);
          response.itemsCount = Number(rows2[0].total);
          response.lastPage = Math.ceil(rows2[0].total / 10);
          res.json(response);
        });
      }
    );
  });

  app.get('/rides/:id', (req, res: ResponseObj, next: NextFunction) => {
    db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, function dbCb(
      err,
      rows
    ) {
      if (err) {
        return next(new HttpException(err.message));
      }

      if (rows.length === 0) {
        return next(new HttpException('Could not find any rides', 404));
      }

      res.json(res.createResponse(rows));
    });
  });

  app.use(errorHandlerMiddleware);
  return app;
};

export default appRouter;
