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

// Get a specific activity by ID badabing
async function getActivity(req, res) {
  const activityId = req.params.id;
  
  const activity = {};
  res.json(activity);
}

async function updateActivity(req, res) {
  const activityId = req.params.id;
  const updatedActivity = req.body; 
  // Add code to update the activity in your database
  res.json(updatedActivity); // Respond with the updated activity
}

async function deleteActivity(req, res) {
  const activityId = req.params.id;
  // Add code to delete the activity from your database
  res.status(204).send(); // R
};