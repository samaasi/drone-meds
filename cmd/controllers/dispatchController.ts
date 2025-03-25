import prisma from "../utils/prisma";
import { Request, Response } from "express";
import { DroneState } from "@prisma/client";
import ResponseUtility from "../utils/response";
import { generateMedicationCode } from "../utils/mediCode";
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

/** loading a drone with medication items */
export const LoadDroneWithMedication = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { medicationIds } = req.body;


    const drone = await prisma.drone.findUnique({
        where: { id },
        select: { state: true, batteryCapacity: true, weightLimit: true },
    });

    if (!drone) {
        return ResponseUtility.error(res, 404, 'Drone not found');
    }

    if (drone.state !== DroneState.IDLE && drone.state !== DroneState.LOADING) {
        return ResponseUtility.error(res, 400, `Cannot load drone in "${drone.state}" state`);
    }

    if (drone.batteryCapacity < 25) {
        return ResponseUtility.error(res, 400, `Battery level too low (${drone.batteryCapacity}%)`);
    }

    const medications = await prisma.medication.findMany({
        where: {
            id: { in: medicationIds },
            Delivery: null,
        },
    });

    if (medications.length !== medicationIds.length) {
        return ResponseUtility.error(res, 400, "Some medications are invalid or already loaded");
    }

    const totalWeight = medications.reduce((sum, med) => sum + med.weight, 0);
    if (totalWeight > drone.weightLimit) {
        return ResponseUtility.error(res, 400, `Total weight (${totalWeight}gr) exceeds drone limit (${drone.weightLimit}gr)`);
    }

    const [delivery] = await prisma.$transaction([
        prisma.delivery.create({
            data: {
                droneId: id,
                medications: {
                    connect: medicationIds.map((id: string) => ({ id })),
                },
            },
            include: {
                medications: true,
            },
        }),
        prisma.drone.update({
            where: { id },
            data: { state: DroneState.LOADED },
        }),
    ]);

    return ResponseUtility.success(res, delivery, 201, "Medications loaded successfully");
});

/** checking loaded medication items for a given drone */
export const CheckDroneLoadedMedication = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const drone = await prisma.drone.findUnique({
        where: { id },
        include: {
            Delivery: {
                include: {
                    medications: true,
                },
            },
        },
    });

    if (!drone) {
        return ResponseUtility.error(res, 404, "Drone not found.");
    }

    const medications = drone.Delivery.flatMap(
        delivery => delivery.medications
    );

    return ResponseUtility.success(res, medications);
});

/** Out of scope functions */

export const GetAllMedications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const medications = await prisma.medication.findMany();

    return ResponseUtility.success(res, medications, 200, "Medications retrieved successfully");
});

export const GetUnloadedMedications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const medications = await prisma.medication.findMany({
        where: { deliveryId: null },
    });

    return ResponseUtility.success(res, medications, 200, "Unloaded medications retrieved successfully");
});


