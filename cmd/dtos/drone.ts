export interface DroneDTO {
    model: 'Lightweight' | 'Middleweight' | 'Cruiserweight' | 'Heavyweight';
    weightLimit: number;
    batteryCapacity: number;
    state: 'IDLE' | 'LOADING' | 'LOADED' | 'DELIVERING' | 'DELIVERED' | 'RETURNING';
}