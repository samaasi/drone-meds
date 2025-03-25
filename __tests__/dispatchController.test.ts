import prisma from '../cmd/utils/prisma';
import { DroneState } from '@prisma/client';
import { Request, Response } from 'express';
import {
    CreateDrone,
    CreateMedication,
    GetAllMedications,
    GetAvailableDrones,
    CheckDroneBatteryLevel,
    GetUnloadedMedications,
    LoadDroneWithMedication,
    CheckDroneLoadedMedication
} from '../cmd/controllers/dispatchController';
import { createId } from '@paralleldrive/cuid2';
import ResponseUtility from '../cmd/utils/response';
import { generateMedicationCode } from '../cmd/utils/mediCode';
import { generateDroneSerialNumber } from '../cmd/utils/generateSerialNumber';

jest.mock('../cmd/utils/prisma', () => ({
    __esModule: true,
    default: {
        drone: {
            create: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        medication: {
            create: jest.fn(),
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

jest.mock('@paralleldrive/cuid2', () => ({
    createId: jest.fn()
}));

jest.mock('../cmd/utils/generateSerialNumber', () => ({
    generateDroneSerialNumber: jest.fn()
}));

jest.mock('../cmd/utils/mediCode', () => ({
    generateMedicationCode: jest.fn()
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
        (createId as jest.Mock).mockReturnValue('mocked-cuid');
        (generateDroneSerialNumber as jest.Mock).mockReturnValue('DRN-ZRQAXYEBN96JNQ5');
        (generateMedicationCode as jest.Mock).mockReturnValue('IBUPR-400mg-SYR-WLL-8B5168-25');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('CreateDrone', () => {
        it('should create a new drone', async () => {
            req.body = {
                model: 'Lightweight',
                weightLimit: 500,
                batteryCapacity: 100,
                state: DroneState.IDLE
            };

            const mockDrone = {
                id: 'mocked-cuid',
                serialNumber: 'DRN-ZRQAXYEBN96JNQ5',
                model: 'Lightweight',
                weightLimit: 500,
                batteryCapacity: 100,
                state: DroneState.IDLE
            };

            (prisma.drone.create as jest.Mock).mockResolvedValue(mockDrone);

            await CreateDrone(req as Request, res as Response, next);

            expect(prisma.drone.create).toHaveBeenCalled();
            expect(ResponseUtility.success).toHaveBeenCalledWith(res, mockDrone, 201, 'Drone registered successfully');
        });
    });

    describe('CreateMedication', () => {
        it('should create a new medication', async () => {
            req.body = {
                name: 'Ibuprofen',
                weight: 400,
                image: '/medications/ibuprofen.jpg'
            };

            const mockMedication = {
                id: 'mocked-cuid',
                name: 'Ibuprofen',
                weight: 400,
                code: 'IBUPR-400mg-SYR-WLL-8B5168-25',
                image: '/medications/ibuprofen.jpg'
            };

            (prisma.medication.create as jest.Mock).mockResolvedValue(mockMedication);

            await CreateMedication(req as Request, res as Response, next);

            expect(prisma.medication.create).toHaveBeenCalled();
            expect(ResponseUtility.created).toHaveBeenCalledWith(res, mockMedication, 201, 'Medication created successfully');
        });
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