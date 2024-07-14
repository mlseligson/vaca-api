import express from 'express';
import { pool, connectToPool } from '../db.js';

const tripsRouter = express.Router();

tripsRouter.use(connectToPool);

tripsRouter.get('/', indexTrips);
tripsRouter.post('/', createTrip);
tripsRouter.get('/:id', getTrip);
tripsRouter.patch('/:id', updateTrip);
tripsRouter.delete('/:id', deleteTrip);

export default tripsRouter;

async function indexTrips(req, res) {
  const trips = await req.client.query('SELECT * FROM trips');

  req.client.release();
  res.json(trips.rows);
}

async function createTrip(req, res) {
  const trip = await req.client.query({
    text: 'INSERT INTO trips (name, destination, cost) VALUES ($1, $2, $3) RETURNING *',
    values: [req.body.name, req.body.destination, req.body.cost]
  });

  req.client.release();
  
  if (trip.rowCount)
    res.status(201).json(trip.rows[0]);
  else {
    res.status(500).send();
  }
}

async function getTrip(req, res) {
  const trip = await req.client.query({
    text: 'SELECT * FROM trips WHERE id=($1)',
    values: [req.params.id]
  });

  req.client.release();

  if (trip.rowCount) {
    res.json(trip.rows[0]);
  } else {
    res.status(404).send();
  }
}

async function updateTrip(req, res) {
  const trip = await req.client.query({
    text: `UPDATE trips SET
            name = updateIfChanged($1, name),
            destination = updateIfChanged($2, destination),
            cost = updateIfChanged($3, cost)
          WHERE id = $4 RETURNING *;`,
    values: [req.body.name, req.body.destination, req.body.cost, req.params.id]
  });

  req.client.release();

  if (trip.rowCount) {
    res.json(trip.rows[0]);
  } else {
    res.status(404).send();
  }
}

async function deleteTrip(req, res) {
  const trip = await req.client.query('DELETE FROM trips WHERE id=$1', [req.params.id]);

  req.client.release();

  if (trip.rowCount) {
    res.status(204).send();
  } else {
    res.status(404).send();
  }
}