import { static as _static, Router } from 'express';
import path from 'path';
import trips from './controllers/trips.js';
import flights from './controllers/flights.js';
import activities from './controllers/activities.js';

import errorHandler from './error.js';
import auth, { init as initPassport, jwtParse } from './controllers/auth.js';

const router = Router();

initPassport();

router.use('/trips', jwtParse, trips);
router.use('/flights', jwtParse, flights);
router.use('/activities', jwtParse, activities);
router.use('/auth', auth);
router.use('/images', _static(path.join(path.resolve(), 'images')));

router.use(errorHandler);

export default router;