/* eslint-disable no-param-reassign */
const request = require('supertest');
const assert = require('assert');
const sqlite3 = require('sqlite3').verbose();
const faker = require('faker');

const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
  const ridesMock = [];

  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err);
      }

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
        ridesMock.push(ride);
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
    it('should return 100 records of mocked ride', (done) => {
      request(app)
        .get('/rides')
        .expect('Content-Type', /json/)
        .expect(function cb(res) {
          res.body.forEach((ride) => {
            ride.rideID = 1;
            ride.created = '2020-01-01 00:00:00';
          });
        })
        .expect(200, ridesMock, done);
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
          res.body.forEach((ride) => {
            ride.rideID = 1;
            ride.created = '2020-01-01 00:00:00';
          });
        })
        .expect(
          200,
          [
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

    it('should return VALIDATION_ERROR when post data startLatitude < -90 (ex. -100)', (done) => {
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
        200,
        {
          error_code: 'VALIDATION_ERROR',
          message:
            'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
        },
        done
      );
    });

    it('should return VALIDATION_ERROR when post empty rider name', (done) => {
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
        200,
        {
          error_code: 'VALIDATION_ERROR',
          message: 'Rider name must be a non empty string',
        },
        done
      );
    });

    it('should return VALIDATION_ERROR when post empty driver name', (done) => {
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
        200,
        {
          error_code: 'VALIDATION_ERROR',
          message: 'Rider name must be a non empty string',
        },
        done
      );
    });

    it('should return VALIDATION_ERROR when post empty vehicle', (done) => {
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
        200,
        {
          error_code: 'VALIDATION_ERROR',
          message: 'Vehicle name must be a non empty string',
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
          .expect(200, rows, done);
      });
    });

    it('should return RIDES_NOT_FOUND_ERROR error when RideID not found (ex. RideID: 1234)', (done) => {
      const rideID = 1234;
      request(app)
        .get(`/rides/${rideID}`)
        .expect('Content-Type', /json/)
        .expect(
          200,
          {
            error_code: 'RIDES_NOT_FOUND_ERROR',
            message: 'Could not find any rides',
          },
          done
        );
    });
  });
});
