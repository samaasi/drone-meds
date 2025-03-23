import { Router } from 'express';
import { CreateDroneSchema } from '../schemas/droneSchema';
import { validateRequest } from "../middlewares/validateRequest";
import { CreateDrone } from '../controllers/droneController';

const router = Router();

/** POST: Register a drone */
router.post('/drones', validateRequest(CreateDroneSchema), CreateDrone);

export default router;