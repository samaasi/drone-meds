import { Router } from 'express';
import {
    CreateDrone,
    CreateMedication,
    GetAllMedications,
    GetAvailableDrones,
    CheckDroneBatteryLevel,
    GetUnloadedMedications,
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

router.post('/medications', CreateMedication);
router.get('/medications', GetAllMedications);
router.get('/medications/unloaded', GetUnloadedMedications);

export default router;