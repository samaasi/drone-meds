import { z } from "zod";
import { DroneModel, DroneState } from "@prisma/client"
import { ValidationSchemas } from '../middlewares/validateRequest';

export const CreateDroneSchema: ValidationSchemas = {
    body: z.object({
        model: z.nativeEnum(DroneModel),
        weightLimit: z.number().max(500),
        batteryCapacity: z.number().min(0).max(100),
        state: z.nativeEnum(DroneState),
    }),
};

export const LoadDroneMedicationSchema: ValidationSchemas = {
    body: z.object({
        medicationIds: z.array(
            z.string().min(1, 'Medication ID is required')
        ).min(1, 'Medication IDs must be a non-empty array')
    }),
};