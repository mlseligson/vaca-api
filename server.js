import express, { Router } from 'express'
import router from './api/router.js'
import logger from 'morgan'
import cors from 'cors'

let app = express();

app.use(cors());
app.use(logger('tiny'));
app.use(express.json());

app.use('/api', router);

app.get('/', (req, res) => {
  res.json({a: req.query.a})
});

app.listen(3000, () => {
  console.log("Listening on port 3000")
});

