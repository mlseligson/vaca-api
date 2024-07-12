import express, { Router } from 'express'
import router from './api/router.js'

let app = express();

app.use(express.json());

app.use(router);

app.get('/', (req, res) => {
  res.json({a: req.query.a})
})

app.listen(3000, () => {
  console.log("Listening on port 3000")
});

