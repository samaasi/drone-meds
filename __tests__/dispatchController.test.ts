import prisma from '../cmd/utils/prisma';
import { DroneState } from '@prisma/client';
import {
    CreateDrone,
    GetAvailableDrones,
    CheckDroneBatteryLevel,
    LoadDroneWithMedication,
    CheckDroneLoadedMedication
} from '../cmd/controllers/dispatchController';
import ResponseUtility from '../cmd/utils/response';
import { Request, Response, NextFunction } from 'express';

jest.mock('../cmd/utils/prisma', () => ({
    __esModule: true,
    default: {
        drone: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        medication: {
            findMany: jest.fn(),
        },
        $transaction: jest.fn(),
    },
}));

jest.mock('../cmd/utils/response', () => ({
    __esModule: true,
    default: {
        created: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
        validationError: jest.fn(),
        paginated: jest.fn(),
        empty: jest.fn()
    }
}));

describe('Dispatch Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let json: jest.Mock;
    let status: jest.Mock;
    let next: jest.Mock;

    beforeEach(() => {
        req = {};
        json = jest.fn();
        status = jest.fn().mockReturnValue({ json });
        res = { status } as Partial<Response>;
        next = jest.fn();

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GetAvailableDrones', () => {
        it('should return available drones', async () => {
            const mockDrones = [
                {
                    id: '1',
                    serialNumber: 'DRONE123',
                    model: 'Lightweight',
                    weightLimit: 500,
                    batteryCapacity: 100,
                    state: DroneState.IDLE
                }
            ];

            (prisma.drone.findMany as jest.Mock).mockResolvedValue(mockDrones);

            await GetAvailableDrones(req as Request, res as Response, next);

            expect(prisma.drone.findMany).toHaveBeenCalled();
            expect(ResponseUtility.success).toHaveBeenCalled();
        });
    });

    describe('CheckDroneBatteryLevel', () => {
        it('should return 404 if drone not found', async () => {
            req.params = { id: 'cm8l3vesl0000w7qcmq1j' };

            (prisma.drone.findUnique as jest.Mock).mockResolvedValue(null);

            await CheckDroneBatteryLevel(req as Request, res as Response, next);

            expect(prisma.drone.findUnique).toHaveBeenCalled();
            expect(ResponseUtility.error).toHaveBeenCalledWith(res, 404, 'Drone not found');
        });
    });

    //

});