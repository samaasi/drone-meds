import { Router } from 'express';
import { CreateDrone } from '../controllers/droneController';

const router = Router();

/** POST: Register a drone */
router.post('/drones', CreateDrone);

export default router;