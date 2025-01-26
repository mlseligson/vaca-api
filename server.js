import express from 'express'
import router from './api/router.js'
import logger from 'morgan'
import cors from 'cors'
import path from 'node:path'

let app = express();

app.use(cors());
app.use(logger('tiny'));
app.use(express.json());

app.use('/api', router);


app.use('/', express.static(path.join(path.resolve(), 'frontend')));
app.get('*', (req, res) => {
  res.sendFile(path.join(path.resolve(), 'frontend/index.html'));
});

app.listen(3000, () => {
  console.log("Listening on port 3000")
});
