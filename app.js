const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const globalErrorHandling = require('./controller/errorController');
const caseRouter = require('./routers/caseRouter');
const AppError = require('./utils/AppError');

//Create app
const app = express();

//Middleware
app.use(cors());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Routers
app.get('/', (req, res) => {
  res.status(200).send('Hello word from to server!');
});

app.use('/api/case', caseRouter);

app.use('*', (req, res, next) => {
  const err = new AppError(
    `The router ${req.originalUrl} not found on this server!`,
    404
  );
  next(err);
});

//Global error handling  middleware
app.use(globalErrorHandling);

module.exports = app;
