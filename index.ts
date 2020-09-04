/* eslint-disable global-require */
import sqlite3lib from 'sqlite3';
import buildSchemas from './src/schemas';
import appRouter from './src/app';

const port = 8010;

const sqlite3 = sqlite3lib.verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  buildSchemas(db);

  const app = appRouter(db);

  app.listen(port, () =>
    // eslint-disable-next-line no-console
    console.log(`App started and listening on port ${port}`)
  );
});
