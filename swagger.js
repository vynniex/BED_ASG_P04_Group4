const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'BED Assg API',
    description: 'Medical Care For Seniors API'
  },
  host: 'localhost:3000'
};

const outputFile = './swagger-output.json';
const routes = ['./app.js'];

swaggerAutogen(outputFile, routes, doc).then(() => {
    require('./app.js');
});