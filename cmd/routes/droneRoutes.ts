import { Router } from 'express';
import { CreateDroneSchema } from '../schemas/droneSchema';
import { validateRequest } from "../middlewares/validateRequest";
import {
    CreateDrone,
    GetAvailableDrones,
    CheckDroneBatteryLevel,
} from '../controllers/dispatchController';

const router = Router();

/** POST: Register a drone */
router.post('/drones', validateRequest(CreateDroneSchema), CreateDrone);
router.get('/drones/available', GetAvailableDrones);
router.get('/drones/:id/battery', CheckDroneBatteryLevel);

export default router;