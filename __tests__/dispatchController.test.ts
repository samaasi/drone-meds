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
            update: jest.fn().mockImplementation((args) => ({
                ...args.data,
                id: 'cm8l3vesl0000w7qcmq1j',
                state: DroneState.LOADING,
            })),
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        medication: {
            create: jest.fn(),
            findMany: jest.fn(),
        },
        delivery: {
            create: jest.fn(),
        },
        $transaction: jest.fn().mockImplementation(async (callback) => {
            // Create a mock transaction client
            const txMock = {
                drone: {
                    update: prisma.drone.update,
                },
                delivery: {
                    create: jest.fn().mockResolvedValue({
                        id: 'cm8lzfdl10001w7js3lsyovjw',
                        droneId: 'cm8l3vesl0000w7qcmq1j',
                        medications: [
                            { id: 'cm8l9knny0006w7soxbtbwq85', weight: 200 },
                            { id: 'cm8l9knnp0005w7sovushi80h', weight: 100 }
                        ]
                    }),
                },
            };
            return callback(txMock);
        }),
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
                    serialNumber: 'DRN-ZRQAXYEBN96JNQ5',
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

    it('should load a drone with medications', async () => {
        req.params = { id: 'cm8l3vesl0000w7qcmq1j' };
        req.body = { medicationIds: ['cm8l9knny0006w7soxbtbwq85', 'cm8l9knnp0005w7sovushi80h'] };

        const mockDrone = {
            id: 'cm8l3vesl0000w7qcmq1j',
            state: DroneState.IDLE,
            batteryCapacity: 100,
            weightLimit: 500
        };

        const mockMedications = [
            { id: 'cm8l9knny0006w7soxbtbwq85', weight: 200, name: 'Paracetamol', code: 'PARAC-200mg-CAP-PHA-5FE8CA-25', image: '/medications/paracetamol.jpg' },
            { id: 'cm8l9knnp0005w7sovushi80h', weight: 100, name: 'Ibuprofen', code: 'IBUPR-400mg-SYR-WLL-8B5168-25', image: '/medications/ibuprofen.jpg' }
        ];

        (prisma.drone.findUnique as jest.Mock).mockResolvedValue(mockDrone);
        (prisma.medication.findMany as jest.Mock).mockResolvedValue(mockMedications);

        await LoadDroneWithMedication(req as Request, res as Response, next);

        expect(prisma.drone.findUnique).toHaveBeenCalled();
        expect(prisma.medication.findMany).toHaveBeenCalled();
        expect(prisma.$transaction).toHaveBeenCalled();

        //
    });

    describe('CheckDroneBatteryLevel', () => {
        it('should return 404 if drone not found', async () => {
            req.params = { id: 'cm8l3vesl0000w7qcmq1j' };

            (prisma.drone.findUnique as jest.Mock).mockResolvedValue(null);

            await CheckDroneBatteryLevel(req as Request, res as Response, next);

            expect(prisma.drone.findUnique).toHaveBeenCalled();
            expect(ResponseUtility.error).toHaveBeenCalledWith(res, 404, 'Drone not found');
        });

        it('should return battery level if drone is found', async () => {
            req.params = { id: 'cm8l3vesl0000w7qcmq1j' };

            const mockDrone = {
                serialNumber: 'DRN-ZRQAXYEBN96JNQ5',
                batteryCapacity: 80
            };

            (prisma.drone.findUnique as jest.Mock).mockResolvedValue(mockDrone);

            await CheckDroneBatteryLevel(req as Request, res as Response, next);

            expect(prisma.drone.findUnique).toHaveBeenCalled();
            expect(ResponseUtility.success).toHaveBeenCalledWith(res, mockDrone, 200, 'Battery level retrieved successfully');
        });
    });

    describe('CheckDroneLoadedMedication', () => {
        it('should return loaded medications for a drone', async () => {
            req.params = { id: 'cm8l3vesl0000w7qcmq1j' };

            const mockDrone = {
                Delivery: [
                    {
                        medications: [
                            { id: 'cm8l9knny0006w7soxbtbwq85', name: 'Ibuprofen', weight: 400 },
                            { id: 'cm8l9knmw0000w7sone638rji', name: 'Paracetamol', weight: 200 }
                        ]
                    }
                ]
            };

            (prisma.drone.findUnique as jest.Mock).mockResolvedValue(mockDrone);

            await CheckDroneLoadedMedication(req as Request, res as Response, next);

            expect(prisma.drone.findUnique).toHaveBeenCalled();
            expect(ResponseUtility.success).toHaveBeenCalledWith(res, mockDrone.Delivery[0].medications, 200, 'Loaded medications retrieved successfully');
        });
    });

    describe('GetAllMedications', () => {
        it('should return all medications', async () => {
            const mockMedications = [
                { id: 'cm8l9knny0006w7soxbtbwq85', name: 'Ibuprofen', weight: 400 },
                { id: 'cm8l9knmw0000w7sone638rji', name: 'Paracetamol', weight: 200 }
            ];

            (prisma.medication.findMany as jest.Mock).mockResolvedValue(mockMedications);

            await GetAllMedications(req as Request, res as Response, next);

            expect(prisma.medication.findMany).toHaveBeenCalled();
            expect(ResponseUtility.success).toHaveBeenCalledWith(res, mockMedications, 200, 'Medications retrieved successfully');
        });
    });

    describe('GetUnloadedMedications', () => {
        it('should return unloaded medications', async () => {
            const mockMedications = [
                { id: 'cm8l9knny0006w7soxbtbwq85', name: 'Ibuprofen', weight: 400 },
                { id: 'cm8l9knmw0000w7sone638rji', name: 'Paracetamol', weight: 200 }
            ];

            (prisma.medication.findMany as jest.Mock).mockResolvedValue(mockMedications);

            await GetUnloadedMedications(req as Request, res as Response, next);

            expect(prisma.medication.findMany).toHaveBeenCalled();
            expect(ResponseUtility.success).toHaveBeenCalledWith(res, mockMedications, 200, 'Unloaded medications retrieved successfully');
        });
    });
});