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