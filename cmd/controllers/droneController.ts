import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import ResponseUtility from '../utils/response';
import { asyncHandler } from "../middlewares/errorHandler";

const prisma = new PrismaClient();

export const CreateDrone = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { model, weightLimit, batteryCapacity, state } = req.body;

    const drone = await prisma.drone.create({
        data: {
            serialNumber: `Drone-${Math.floor(Math.random() * 1000000)}`,
            model: model,
            weightLimit: weightLimit,
            batteryCapacity: batteryCapacity,
            state: state,
        },
    });

    return ResponseUtility.created(res, drone);
});