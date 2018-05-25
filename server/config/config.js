export default {
  apiPrefix: "http://localhost:8080",
  serverPort: "8080",
  db: {
    name: "prozorroA",
    host: "localhost",
    port: "27017"
  },
  prefix: 'https://public.api.openprocurement.org/api/2.4/tenders/',
  startUri: `https://public.api.openprocurement.org/api/2.4/tenders?offset=${new Date().toLocaleString(['ban', 'id']).split(' ')[0].split('/').reverse().join('-')}`,
  minAmount: 5000000,
  maxAmount: 10000000000
}