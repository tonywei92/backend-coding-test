/* eslint-disable no-param-reassign */
import request from 'supertest';
import assert from 'assert';
import sqlite3lib from 'sqlite3';
import faker from 'faker';
import appLib from '../src/app';
import buildSchemas from '../src/schemas';
import {
  ResponseShape,
  createResponse,
} from '../src/middlewares/createResponse';

const sqlite3 = sqlite3lib.verbose();

const db = new sqlite3.Database(':memory:');

const dbError = {
  run: (a: string, b: any[], cb: (err: Error) => void) => {
    cb(new Error('error'));
  },
  all: (a: string, cb: (err: Error) => void) => {
    cb(new Error('error'));
  },
};

const app = appLib(db);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const appError = appLib(dbError as any);

type Ride = {
  rideID: number;
  created: string;
  startLat: number;
  startLong: number;
  endLat: number;
  endLong: number;
  riderName: string;
  driverName: string;
  driverVehicle: string;
};

describe('API tests', () => {
  const ridesMock: ResponseShape = {
    status: 'success',
    data: [],
    message: '',
  };

  before((done) => {
    db.serialize(() => {
      buildSchemas(db);

      // mock data
      for (let i = 0; i < 100; i += 1) {
        const ride = {
          rideID: 1,
          created: '2020-01-01 00:00:00',
          startLat: Number.parseFloat(faker.address.latitude()),
          startLong: Number.parseFloat(faker.address.longitude()),
          endLat: Number.parseFloat(faker.address.latitude()),
          endLong: Number.parseFloat(faker.address.longitude()),
          riderName: faker.name.findName(),
          driverName: faker.name.findName(),
          driverVehicle: faker.random.word(),
        };
        ridesMock.data.push(ride);
        db.run(
          `INSERT INTO Rides
            (
                startLat,
                startLong,
                endLat,
                endLong,
                riderName,
                driverName,
                driverVehicle)
            VALUES (?,?,?,?,?,?,?)`,
          ride.startLat,
          ride.startLong,
          ride.endLat,
          ride.endLong,
          ride.riderName,
          ride.driverName,
          ride.driverVehicle
        );
      }
      done();
    });
  });

  describe('GET /health', () => {
    it('should return health', (done) => {
      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done);
    });
  });

  describe('GET /rides', () => {
    it('should return first 10 ride records (page 1)', (done) => {
      const { data, message, status } = ridesMock;
      const response: ResponseShape = {
        data: data.slice(0, 10),
        message,
        status,
        itemsCount: 100,
        lastPage: 10,
        page: 1,
      };
      request(app)
        .get('/rides')
        .expect('Content-Type', /json/)
        .expect(function cb(res) {
          res.body.data.forEach((ride: Ride) => {
            ride.rideID = 1;
            ride.created = '2020-01-01 00:00:00';
          });
        })
        .expect(200, response, done);
    });

    it('should return 10 ride records on page 5', (done) => {
      const page = 5;
      const { data, message, status } = ridesMock;
      const response: ResponseShape = {
        data: data.slice((page - 1) * 10, (page - 1) * 10 + 10),
        message,
        status,
        itemsCount: 100,
        lastPage: 10,
        page,
      };
      request(app)
        .get(`/rides/?page=${page}`)
        .expect('Content-Type', /json/)
        .expect(function cb(res) {
          res.body.data.forEach((ride: Ride) => {
            ride.rideID = 1;
            ride.created = '2020-01-01 00:00:00';
          });
        })
        .expect(200, response, done);
    });

    it('should return empty ride records on page 999999 (no records at this page)', (done) => {
      const page = 999999;
      const { message, status } = ridesMock;
      const response: ResponseShape = {
        data: [],
        message,
        status,
        itemsCount: 100,
        lastPage: 10,
        page,
      };
      request(app)
        .get(`/rides/?page=${page}`)
        .expect('Content-Type', /json/)
        .expect(function cb(res) {
          res.body.data.forEach((ride: Ride) => {
            ride.rideID = 1;
            ride.created = '2020-01-01 00:00:00';
          });
        })
        .expect(200, response, done);
    });

    it('should return error 500 on db error', (done) => {
      request(appError).get('/rides').expect('Content-Type', /json/).expect(
        500,
        {
          message: 'error',
          status: 'error',
          data: null,
        },
        done
      );
    });
  });

  describe('POST /rides', () => {
    it('should return the posted ride', (done) => {
      const ridePostData = {
        start_lat: 0,
        start_long: 0,
        end_lat: 0,
        end_long: 0,
        rider_name: 'John Doe',
        driver_name: 'Tony',
        driver_vehicle: 'Honda X',
      };
      request(app)
        .post('/rides')
        .send(ridePostData)
        .expect(function cb(res) {
          res.body.data.forEach((ride: Ride) => {
            ride.rideID = 1;
            ride.created = '2020-01-01 00:00:00';
          });
        })
        .expect(
          201,
          {
            status: 'success',
            message: '',
            data: [
              {
                rideID: 1,
                created: '2020-01-01 00:00:00',
                startLat: 0,
                startLong: 0,
                endLat: 0,
                endLong: 0,
                riderName: 'John Doe',
                driverName: 'Tony',
                driverVehicle: 'Honda X',
              },
            ],
          },
          done
        );
    });

    it('should return 101 records after last POST /rides', () => {
      db.all('SELECT count(*) as record_count FROM Rides', function dbcb(
        err,
        rows
      ) {
        assert.equal(rows[0].record_count, 101);
      });
    });

    it('should return validation error when post data startLatitude < -90 (ex. -100)', (done) => {
      const ridePostData = {
        start_lat: -100,
        start_long: 0,
        end_lat: 0,
        end_long: 0,
        rider_name: 'John Doe',
        driver_name: 'Tony',
        driver_vehicle: 'Honda X',
      };
      request(app).post('/rides').send(ridePostData).expect(
        400,
        {
          message: '"start_lat" must be greater than or equal to -90',
          status: 'error',
          data: null,
        },
        done
      );
    });

    it('should return validation error when post empty rider name', (done) => {
      const ridePostData = {
        start_lat: 0,
        start_long: 0,
        end_lat: 0,
        end_long: 0,
        rider_name: '',
        driver_name: 'Tony',
        driver_vehicle: 'Honda X',
      };
      request(app).post('/rides').send(ridePostData).expect(
        400,
        {
          message: '"rider_name" is not allowed to be empty',
          status: 'error',
          data: null,
        },
        done
      );
    });

    it('should return validation error when post empty driver name', (done) => {
      const ridePostData = {
        start_lat: 0,
        start_long: 0,
        end_lat: 0,
        end_long: 0,
        rider_name: 'John Doe',
        driver_name: '',
        driver_vehicle: 'Honda X',
      };
      request(app).post('/rides').send(ridePostData).expect(
        400,
        {
          message: '"driver_name" is not allowed to be empty',
          status: 'error',
          data: null,
        },
        done
      );
    });

    it('should return validation error when post empty vehicle', (done) => {
      const ridePostData = {
        start_lat: 0,
        start_long: 0,
        end_lat: 0,
        end_long: 0,
        rider_name: 'John Doe',
        driver_name: 'Tony',
        driver_vehicle: '',
      };
      request(app).post('/rides').send(ridePostData).expect(
        400,
        {
          message: '"driver_vehicle" is not allowed to be empty',
          status: 'error',
          data: null,
        },
        done
      );
    });

    it('should return error 500 on db error', (done) => {
      const ridePostData = {
        start_lat: 0,
        start_long: 0,
        end_lat: 0,
        end_long: 0,
        rider_name: 'John Doe',
        driver_name: 'Tony',
        driver_vehicle: 'Honda X',
      };
      request(appError)
        .post('/rides')
        .send(ridePostData)
        .expect('Content-Type', /json/)
        .expect(
          500,
          {
            message: 'error',
            status: 'error',
            data: null,
          },
          done
        );
    });
  });

  describe('GET /rides/:id', () => {
    it('should return a ride object with id 10', (done) => {
      const rideID = 10;
      db.all(`SELECT * FROM Rides WHERE rideID='${rideID}'`, function dbcb(
        err,
        rows
      ) {
        request(app)
          .get(`/rides/${rideID}`)
          .expect('Content-Type', /json/)
          .expect(200, createResponse(rows), done);
      });
    });

    it('should return RIDES_NOT_FOUND_ERROR error when RideID not found (ex. RideID: 1234)', (done) => {
      const rideID = 1234;
      request(app)
        .get(`/rides/${rideID}`)
        .expect('Content-Type', /json/)
        .expect(
          404,
          {
            message: 'Could not find any rides',
            status: 'error',
            data: null,
          },
          done
        );
    });

    it('should return error 500 on db error', (done) => {
      const rideID = 1234;
      request(appError)
        .get(`/rides/${rideID}`)
        .expect('Content-Type', /json/)
        .expect(
          500,
          {
            message: 'error',
            status: 'error',
            data: null,
          },
          done
        );
    });
  });
});
