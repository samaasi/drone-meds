import { CronJob } from 'cron';
import prisma from '../utils/prisma';
import { DroneState } from '@prisma/client';

type CronTask = CronJob;

const CRON_SCHEDULE = '*/10 * * * *';
const BATTERY_THRESHOLD = 25;
const MIN_BATTERY_DRAIN = 1;
const MAX_BATTERY_DRAIN = 3;

let batteryCheckTask: CronTask | null = null;

const getRandomDrain = (): number => {
    return Math.round(
        Math.random() * (MAX_BATTERY_DRAIN - MIN_BATTERY_DRAIN) + MIN_BATTERY_DRAIN
    );
};

const logBatteryLevels = async (drones: Array<{ id: string; batteryCapacity: number }>) => {
    await prisma.batteryLog.createMany({
        data: drones.map(drone => ({
            droneId: drone.id,
            batteryLevel: drone.batteryCapacity,
        })),
    });
};

const processDrone = async (drone: { id: string; batteryCapacity: number; state: DroneState; serialNumber: string }) => {
    const updates = {
        battery: Math.max(0, drone.batteryCapacity - getRandomDrain()),
        state: drone.state,
    };

    if (drone.batteryCapacity < BATTERY_THRESHOLD) {
        console.log(`Low battery alert: Drone ${drone.serialNumber} (${drone.batteryCapacity}%)`);

        if (drone.state === DroneState.LOADING) {
            console.log(`Scheduling state change to IDLE for ${drone.serialNumber}`);
            updates.state = DroneState.IDLE;
        }
    }

    return {
        id: drone.id,
        ...updates,
    };
};

const applyUpdates = async (updates: Array<{ id: string; battery: number; state: DroneState }>) => {
    const transaction = updates.map(update =>
        prisma.drone.update({
            where: { id: update.id },
            data: {
                batteryCapacity: update.battery,
                state: update.state,
            },
        })
    );

    await prisma.$transaction(transaction);
};

const executeBatteryCheck = async () => {
    console.log('Starting battery check cycle...');
    try {
        const drones = await prisma.drone.findMany();
        if (drones.length === 0) return;

        await logBatteryLevels(drones);

        const updates = await Promise.all(
            drones.map(async drone => {
                try {
                    return await processDrone(drone);
                } catch (error) {
                    console.error(`Error processing drone ${drone.serialNumber}:`, error);
                    return null;
                }
            })
        );

        const validUpdates = updates.filter(Boolean) as Array<{
            id: string;
            battery: number;
            state: DroneState;
        }>;

        if (validUpdates.length > 0) {
            await applyUpdates(validUpdates);
        }

        console.log(`Completed battery check for ${drones.length} drones`);
    } catch (error) {
        console.error('Battery check cycle failed:', error);
    }
};

export const startBatteryCheckService = (): void => {
    if (!batteryCheckTask) {
        batteryCheckTask = CronJob.from({
            cronTime: CRON_SCHEDULE,
            onTick: () => {
                executeBatteryCheck().catch(console.error);
            },
            start: true,
            timeZone: 'UTC'
        });
        console.log('Battery monitoring service started');
    }
};

export const stopBatteryCheckService = (): void => {
    if (batteryCheckTask) {
        batteryCheckTask.stop();
        batteryCheckTask = null;
        console.log('Battery monitoring service stopped');
    }
};

const handleShutdown = () => {
    stopBatteryCheckService();
    process.exit();
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);