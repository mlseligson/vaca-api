import express from 'express'
import { connectToPool } from '../db.js';
import { StatusError } from '../error.js';
import { executeQuery, activitiesGenerationConfig } from './gemini.js';

const activitiesRouter = express.Router();

activitiesRouter.use(connectToPool);

activitiesRouter.get('/suggest', suggestActivities);

activitiesRouter.get('/trip/:tripId', indexActivities);
activitiesRouter.post('/trip/:tripId', createActivity);
activitiesRouter.get('/:id', getActivity);
activitiesRouter.patch('/:id', updateActivity);
activitiesRouter.delete('/:id', deleteActivity);



export default activitiesRouter;

// NEEDS FINISHED
async function indexActivities(req, res, next) {
  try {
    const { tripId } = req.params;
    const { filter, sort, order, page, limit } = req.query;

    const activities = await req.client.query({
      text:  `SELECT * FROM activities
              WHERE trip_id = $1 AND
                (
                  COALESCE(name, '') || ' ' ||
                  COALESCE(description, '') || ' ' ||
                  COALESCE(location, '')
                  ILIKE '%' || $2 || '%'
                OR
                  COALESCE(TRIM($2), '') = ''
                )
              ORDER BY ${sort} ${order}
              LIMIT $3 OFFSET $4`,
      values: [tripId, filter, limit, page * limit]
    });

    // FULL TEXT SEARCH (DOES NOT "FUZZY" SEARCH)
    //
    // const activities = await req.client.query({
    //   text: `SELECT * FROM activities
    //           WHERE trip_id = $1
    //           AND to_tsvector('english',
    //               COALESCE(name, '') || ' ' ||
    //               COALESCE(description, '') || ' ' ||
    //               COALESCE(location, '')
    //             ) @@ to_tsquery('english', $2)
    //           OR COALESCE(TRIM($2), '') = ''
    //           ORDER BY ${sort} ${order}
    //           LIMIT $3 OFFSET $4`,
    //   values: [tripId, filter, limit, page * limit]
    // });

    if (!activities.rowCount)
      throw new StatusError({status: 404});

    res.json(activities.rows);
  } catch(err) {
    next(err);
  } finally {
    req.client.release();
  }
}

function createActivity(req, res, next) {
  const handler = (req.body.bulk) ?
    createMultipleActivities : createSingleActivity;

  handler.call(this, req, res, next);
}

async function createSingleActivity(req, res, next) {
  try {
    const { name, description, location, image_url, start_time, end_time } = req.body;
    const { tripId: trip_id } = req.params;

    const newActivity = await req.client.query({
      text: 'INSERT INTO activities (name, description, location, image_url, start_time, end_time, trip_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      values: [name, description, location, image_url, start_time, end_time, trip_id]
    });

    if (!newActivity.rowCount)
      throw new StatusError({status: 404});

    res.status(201).json(newActivity.rows[0]);
  } catch(err) {
    next(err);
  } finally {
    req.client.release();
  }
}

async function createMultipleActivities(req, res, next) {
  try {
    const { activities } = req.body;
    const { tripId: trip_id } = req.params;
    const list = JSON.stringify(activities.map(name => ({name, trip_id})));

    const newActivities = await req.client.query({
      text: 'INSERT INTO activities (name, trip_id) SELECT * FROM jsonb_to_recordset($1::jsonb) AS x(name text, trip_id int) RETURNING *',
      values: [list]
    });

    if (!newActivities.rowCount)
      throw new StatusError({status: 404});
      
    res.status(201).json({inserted: newActivities.rowCount});
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
      throw new StatusError({status: 404});

    res.json(activity.rows[0]);
  } catch(err) {
    next(err);
  } finally {
    req.client.release();
  }
}

async function updateActivity(req, res, next) {
  try {
    const { name, description, location, image_url, start_time, end_time, trip_id } = req.body;

    const activity = await req.client.query({
      text: `UPDATE activities SET
              name = updateIfChanged($1, name),
              description = updateIfChanged($2, description),
              location = updateIfChanged($3, location),
              image_url = updateIfChanged($4, image_url),
              start_time = updateIfChanged($5, start_time),
              end_time = updateIfChanged($6, end_time),
              trip_id = updateIfChanged($7, trip_id)
            WHERE id = $8 RETURNING *;`,
      values: [name, description, location, image_url, start_time, end_time, trip_id, req.params.id]
    });

    if (!activity.rowCount)
      throw new StatusError({status: 404});

    res.status(202).json(activity.rows[0]);
  } catch(err) {
    next(err);
  } finally {
    req.client.release();
  }
}

async function deleteActivity(req, res, next) {
  try {
    await req.client.query('DELETE FROM activities WHERE id=$1', [req.params.id]);

    res.status(204).send();
  } catch(err) {
    next(err);
  } finally {
    req.client.release();
  }
}

async function suggestActivities(req, res, next) {
  try {
    const trip = await req.client.query('SELECT * FROM trips WHERE id=$1', [req.query.tripId]);
    const { destination, start_time, end_time } = trip.rows[0];

    const query = `
    Location of Trip: ${destination}
    Date Range: ${start_time}-${end_time}
    Example of Fun Activity: ${req.query.example})`;
    const response = await executeQuery(activitiesGenerationConfig, query);

    res.status(200).json(JSON.parse(response));
  } catch(err) {
    next(err);
  } finally {
    req.client.release();
  }
}