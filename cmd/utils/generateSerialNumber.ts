export function generateDroneSerialNumber(prefix: string = 'DRN', length: number = 15): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let serialNumber = prefix + '-';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        serialNumber += chars[randomIndex];
    }

    return serialNumber;
}