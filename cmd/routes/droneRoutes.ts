import { Router } from 'express';
import { CreateDroneSchema } from '../schemas/droneSchema';
import { validateRequest } from "../middlewares/validateRequest";
import {
    CreateDrone,
    GetAvailableDrones
} from '../controllers/dispatchController';

const router = Router();

/** POST: Register a drone */
router.post('/drones', validateRequest(CreateDroneSchema), CreateDrone);
router.get("/drones/available", GetAvailableDrones);

export default router;