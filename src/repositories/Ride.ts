import { Database } from 'sqlite3';

export type Ride = {
  rideID?: number;
  created?: string;
  startLat: number;
  startLong: number;
  endLat: number;
  endLong: number;
  riderName: string;
  driverName: string;
  driverVehicle: string;
};

const Ride = (db: Database) => {
  const count = (): Promise<number> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT count(*) as total FROM Rides';
      db.all(query, function cb(err, rows) {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0].total);
        }
      });
    });
  };

  const all = async (
    page = 0,
    rowsPerPage = 10
  ): Promise<{ rows: Ride[]; count: number }> => {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM Rides';
      if (page > 0) {
        query += ` LIMIT ${rowsPerPage} OFFSET ${
          rowsPerPage * (Number(page) - 1)
        }`;
      }
      db.all(query, async function cb(err, rows) {
        if (err) {
          reject(err);
        } else {
          const countRows = await count();
          resolve({
            rows,
            count: countRows,
          });
        }
      });
    });
  };

  const insert = (values: Ride): Promise<number> => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO Rides(${Object.keys(values).join(', ')})
        VALUES (${Array(Object.keys(values).length).fill('?').join(', ')})`;
      db.run(query, Object.values(values), function cb(error) {
        if (error) {
          reject(error);
        } else {
          resolve(this.lastID);
        }
      });
    });
  };

  const findById = (id: number): Promise<Ride[]> => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM Rides WHERE rideID = ?', id, function cb(
        err,
        rows
      ) {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  };

  return {
    all,
    insert,
    findById,
  };
};

export default Ride;
