import sqlite3lib from 'sqlite3';
import faker from 'faker';
import assert from 'assert';
import buildSchemas from '../src/schemas';
import buildRideRepository, { Ride } from '../src/repositories/Ride';

const sqlite3 = sqlite3lib.verbose();
const db = new sqlite3.Database(':memory:');
const rideRepository = buildRideRepository(db);
const ridesMock: Ride[] = [];

describe('Ride repository test', () => {
  before((done) => {
    db.serialize(() => {
      buildSchemas(db);
      // mock data
      for (let i = 0; i < 15; i += 1) {
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

  describe('test basic functionality', () => {
    it('should insert to Rides table', async () => {
      const ride: Ride = {
        driverName: 'Tony',
        driverVehicle: 'Honda',
        riderName: 'John Doe',
        startLat: 50,
        startLong: -50,
        endLat: 50,
        endLong: -50,
      };
      const insertId = await rideRepository.insert(ride);
      const result = await rideRepository.findById(insertId);
      assert(result.length === 1);
    });

    it('should query all records', async () => {
      const results = await rideRepository.all();
      assert(results.rows.length === 16 && results.count === 16);
    });

    it('should query all records with pagination', async () => {
      const results = await rideRepository.all(2, 10);
      assert(results.rows.length === 6 && results.count === 16);
    });
  });

  describe('SQL injection test', () => {
    it('should return empty array when try sql injection', async () => {
      const result = await rideRepository.findById(
        ('1 OR 1=1' as unknown) as number
      );
      assert(result.length === 0);
    });

    it('should fail to delete table using sql injection', async () => {
      const ride: Ride = {
        driverName: 'Tony',
        driverVehicle: 'Honda',
        startLat: 50,
        startLong: -50,
        endLat: 50,
        endLong: -50,
        riderName: "'); DELETE FROM Rides; --", // sql injection
      };
      await rideRepository.insert(ride);
      const result = await rideRepository.all();
      assert(result.rows.length > 0);
    });
  });
});
