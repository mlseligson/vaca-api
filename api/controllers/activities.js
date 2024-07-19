import express from 'express'
import { connectToPool } from '../db.js';

const activitiesRouter = express.Router();

activitiesRouter.use(connectToPool);

activitiesRouter.get('/', indexActivities);
activitiesRouter.post('/', createActivity);
activitiesRouter.get('/:id', getActivity);
activitiesRouter.patch('/:id', updateActivity);
activitiesRouter.delete('/:id', deleteActivity);

export default activitiesRouter; 


async function indexActivities(req, res) {
  const activities = await req.client.query('SELECT * FROM activities');
  req.client.release();

  if (activities.rowCount) {
    res.json(activities.rows);
  } else {
    res.status(404).send();
  }
}

async function createActivity(req, res, next) {
  try {
    const newActivity = await req.client.query({
      text: 'INSERT INTO activities (name, description, location, trip_id) VALUES ($1, $2, $3, $4) RETURNING *',
      values: [req.body.name, req.body.description, req.body.location, req.body.trip_id]
    });

    res.status(201).json(newActivity.rows[0]);
  } catch(err) {
    next(err);
  } finally {
    req.client.release();
  }
}


async function getActivity(req, res, next) {
  try {
    const activity = await req.client.query('SELECT * FROM activities WHERE id=$1', [req.params.id]);

    if (!activity.rowCount)
      throw new Error({status: 404});

    res.json(activity.rows[0]);
  } catch(err) {
    next(err);
  } finally {
    req.client.release();
  }
}

async function updateActivity(req, res, next) {
  try {
    const activity = await req.client.query({
      text: `UPDATE activities SET
              name = updateIfChanged($1, name),
              description = updateIfChanged($2, description),
              location = updateIfChanged($3, location),
              trip_id = updateIfChanged($4, trip_id)
            WHERE id = $5 RETURNING *;`,
      values: [req.body.name, req.body.description, req.body.location, req.body.trip_id, req.params.id]
    });

    if (!activity.rowCount)
      throw new Error({status: 404});

    res.status(202).json(activity.rows[0]);
  } catch(err) {
    next(err);
  } finally {
    req.client.release();
  }
}

async function deleteActivity(req, res, next) {
  try {
    const activity = await req.client.query('DELETE FROM activities WHERE id=$1', [req.params.id]);

    res.status(204).send();
  } catch(err) {
    next(err);
  } finally {
    req.client.release();
  }
}