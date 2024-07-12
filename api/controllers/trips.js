import express from 'express';
import pool from '../db.js';

const tripsRouter = express.Router();

tripsRouter.get('/', indexTrips);
tripsRouter.post('/', createTrip);
// tripsRouter.get('/:id', getTrip);
// tripsRouter.patch('/:id', updateTrip);

export default tripsRouter;

async function indexTrips(req, res) {
  const client = await pool.connect();
  const trips = await client.query({text: 'SELECT * FROM trips', rowMode: 'array'});

  client.release();
  res.json(trips.rows);
}

async function createTrip(req, res) {
  const client = await pool.connect();
  const trip = await client.query({
    text: 'INSERT INTO trips (name, destination, cost) VALUES ($1, $2, $3)',
    values: [req.query.name, req.query.destination, req.query.cost],
    rowMode: 'array'
  });

  client.release();
  res.json(trip);
}

