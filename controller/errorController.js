const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidateErrorDB = (err) => {
  return new AppError(err.message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  return new AppError(
    `Duplicate field value: ${Object.values(err.keyValue).toString()}`,
    400
  );
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV.trim() === 'production') {
    const error = Object.assign(err);

    if ((error.name = 'CastError')) error = handleCastErrorDB(error);
    if ((error.name = 'ValidationError')) error = handleValidateErrorDB(error);
    if ((error.code = '11000')) error = handleDuplicateFieldsDB(error);

    sendErrorProd(error, res);
  }
};
