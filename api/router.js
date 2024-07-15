import { Router } from 'express';
import trips from './controllers/trips.js';
import flights from './controllers/flights.js';
import activities from './controllers/activities.js';
import errorHandler from './error.js';

const router = Router();

router.use('/trips', trips);
router.use('/flights', flights);
router.use('/activities', activities);

router.use(errorHandler);

export default router;