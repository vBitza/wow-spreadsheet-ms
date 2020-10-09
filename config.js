const _       = require('lodash');

const configDefaults = {
  appName: 'spreadsheet',
  port: process.env.PORT || 1338,
  db: {
    name: 'spreadsheet',
    port: 27017,
    host: 'localhost',
  },
  constants: {
    //Add constants files here
  },
};

const config = {
  dev: _.merge(_.cloneDeep(configDefaults), {
    appName: 'spreadsheet-dev',
  }),
  prod: _.merge(_.cloneDeep(configDefaults), {
    port: 8080,
    db: {
      name: 'spreadsheet',
    },
  }),
  test: _.merge(_.cloneDeep(configDefaults), {
    appName: 'spreadsheet-test',
    port: 2337,
    db: {
      name: 'spreadsheet-test',
    },
  }),
};

module.exports = new Proxy(config, {
  get: (target, propertyName) => {
    let env = process.env.NODE_ENV || 'dev';

    if (!target[env]) {
      env = 'dev';
    }

    if (target[env].hasOwnProperty(propertyName)) {
      return target[env][propertyName];
    }

    return undefined;
  },
});
