import { Router } from 'express';
import {
    CreateDrone,
    GetAvailableDrones,
    CheckDroneBatteryLevel,
    LoadDroneWithMedication,
    CheckDroneLoadedMedication,
} from '../controllers/dispatchController';
import { validateRequest } from "../middlewares/validateRequest";
import { CreateDroneSchema, LoadDroneMedicationSchema } from '../schemas/droneSchema';

const router = Router();

/** POST: Register a drone */
router.post('/drones', validateRequest(CreateDroneSchema), CreateDrone);
router.get('/drones/available', GetAvailableDrones);
router.post(
    '/drones/:id/load',
    validateRequest(LoadDroneMedicationSchema),
    LoadDroneWithMedication
);
router.get('/drones/:id/battery', CheckDroneBatteryLevel);
router.get('/drones/:id/medications', CheckDroneLoadedMedication);

export default router;