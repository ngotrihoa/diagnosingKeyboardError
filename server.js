const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

dotenv.config({ path: './config.env' });

//Connect to mongoDB
const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.connect(db).then(() => {
  console.log('DB connect success!');
});
//   .catch((err) => {
//     console.log('DB connect error!', err.name, err.message);
//   });

//Listening app
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listen on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
