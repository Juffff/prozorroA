"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  apiPrefix: "http://localhost:8080",
  serverPort: "8080",
  db: {
    /* name: "prozorroA",
     host: "localhost",
     port: "27017"*/
    name: "heroku_8l8238dp",
    host: "ds135290.mlab.com",
    port: "35290",
    user: "Juff",
    password: "Splurgeola4848"
  },
  prefix: 'https://public.api.openprocurement.org/api/2.4/tenders/',
  startUri: "https://public.api.openprocurement.org/api/2.4/tenders?offset=" + new Date().toLocaleString(['ban', 'id']).split(' ')[0].split('/').reverse().join('-'),
  minAmount: 5000000,
  maxAmount: 10000000000
};
//# sourceMappingURL=config.js.map