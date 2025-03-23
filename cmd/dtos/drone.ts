import { DroneModel, DroneState } from "@prisma/client"

export interface DroneDTO {
    model: DroneModel;
    weightLimit: number;
    batteryCapacity: number;
    state: DroneState;
}