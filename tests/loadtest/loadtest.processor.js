/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-var-requires */
const faker = require('faker');

module.exports = {
  generateRandomData,
};

// Make sure to "npm install faker" first.

function generateRandomData(userContext, events, done) {
  userContext.vars.startLat = Number.parseFloat(faker.address.latitude());
  userContext.vars.startLong = Number.parseFloat(faker.address.longitude());
  userContext.vars.endLat = Number.parseFloat(faker.address.latitude());
  userContext.vars.endLong = Number.parseFloat(faker.address.longitude());
  userContext.vars.riderName = faker.name.findName();
  userContext.vars.driverName = faker.name.findName();
  userContext.vars.driverVehicle = faker.random.word();
  return done();
}
