import { randomBytes } from 'crypto';

interface MedicationDetails {
    name: string;
    weight: number;
    form?: string;
    manufacturer?: string;
    batch?: string;
    year?: number;
}

const FORM_CODES: Record<string, string> = {
    Tablet: 'TAB',
    Capsule: 'CAP',
    Syrup: 'SYR',
    Injection: 'INJ',
    Cream: 'CRM',
    Gel: 'GEL',
};

const MANUFACTURER_CODES: Record<string, string> = {
    PharmaA: 'PHA',
    PharmaB: 'PHB',
    HealthCorp: 'HLC',
    MediCare: 'MCR',
    WellnessInc: 'WLL',
};

const getRandomCode = (codes: Record<string, string>): string =>
    Object.values(codes)[Math.floor(Math.random() * Object.values(codes).length)];

const getCode = (key: string | undefined, codes: Record<string, string>): string =>
    key ? codes[key] : getRandomCode(codes);

const generateBatch = (): string => randomBytes(3).toString('hex').toUpperCase();

export function generateMedicationCode(details: MedicationDetails): string {
    const components = [
        details.name.replace(/\W/g, '').slice(0, 5).toUpperCase(),
        `${details.weight}mg`,
        getCode(details.form, FORM_CODES),
        getCode(details.manufacturer, MANUFACTURER_CODES),
        details.batch || generateBatch(),
        (details.year ?? new Date().getFullYear()).toString().slice(-2),
    ];

    return components.join('-');
}
