import prisma from "../utils/prisma";
import { Request, Response } from "express";
import { DroneState } from "@prisma/client";
import ResponseUtility from "../utils/response";
import { asyncHandler } from "../middlewares/errorHandler";
import { generateDroneSerialNumber } from "../utils/generateSerialNumber";

/** registering a drone */
export const CreateDrone = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { model, weightLimit, batteryCapacity, state } = req.body;

    const drone = await prisma.drone.create({
        data: {
            serialNumber: generateDroneSerialNumber(),
            model: model,
            weightLimit: weightLimit,
            batteryCapacity: batteryCapacity,
            state: state,
        },
    });

    return ResponseUtility.created(res, drone);
});

/** checking available drones for loading */
export const GetAvailableDrones = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const drones = await prisma.drone.findMany({
        where: {
            AND: [
                { state: DroneState.IDLE },
                { batteryCapacity: { gte: 25 } },
            ],
        },
    });

    return ResponseUtility.success(res, drones);
});

/** check drone battery level for a given drone */
export const CheckDroneBatteryLevel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const drone = await prisma.drone.findUnique({
        where: { id },
        select: { serialNumber: true, batteryCapacity: true },
    });

    if (!drone) {
        return ResponseUtility.error(res, 404, 'Drone not found');
    }

    return ResponseUtility.success(res, drone);
});

// loading a drone with medication items
// checking loaded medication items for a given drone

