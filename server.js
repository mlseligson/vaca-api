import express from 'express'
import router from './api/router.js'
import logger from 'morgan'
import cors from 'cors'
import path from 'node:path'
import errorHandler from './api/error.js';

let app = express();

app.use(cors());
app.use(logger('tiny'));
app.use(express.json());

app.use('/api', router);
app.use(errorHandler);

app.listen(3000, () => {
  console.log("Listening on port 3000")
});
