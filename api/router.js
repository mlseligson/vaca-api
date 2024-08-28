import { Router } from 'express';
import trips from './controllers/trips.js';
import flights from './controllers/flights.js';
import activities from './controllers/activities.js';

import errorHandler from './error.js';
import auth, { init as initPassport } from './controllers/auth.js';

const router = Router();

router.use('/trips', trips);
router.use('/flights', flights);
router.use('/activities', activities);

initPassport();
router.use('/auth', auth);

router.use(errorHandler);

export default router;