import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const CreateDrone = async (req: Request, res: Response): Promise<void> => {
    const { model, weightLimit, batteryCapacity, state } = req.body;

    try {
        const drone = await prisma.drone.create({
            data: {
                serialNumber: `Drone-${Math.floor(Math.random() * 1000000)}`,
                model: model,
                weightLimit: weightLimit,
                batteryCapacity: batteryCapacity,
                state: state,
            },
        });

        res.status(201).json(drone);
    } catch (error) {
        console.log(error);
    }
}