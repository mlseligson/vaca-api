import { Router } from 'express';
import trips from './controllers/trips.js';
import flights from './controllers/flights.js';

const router = Router();

router.use('/trips', trips);
router.use('/flights', flights);

export default router;