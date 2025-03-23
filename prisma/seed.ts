import prisma from "../cmd/utils/prisma";
import { generateMedicationCode } from "../cmd/utils/mediCode";

// Create some medications
const MEDICATIONS = [
    {
        name: 'Amoxicillin',
        weight: 250,
        image: '/medications/amoxicillin.jpg'
    },
    {
        name: 'Ibuprofen',
        weight: 400,
        image: '/medications/ibuprofen.jpg'
    },
    {
        name: 'Paracetamol',
        weight: 200,
        image: '/medications/paracetamol.jpg'
    },
    {
        name: 'Insulin',
        weight: 100,
        image: '/medications/insulin.jpg'
    },
    {
        name: 'Antibiotics',
        weight: 75,
        image: '/medications/antibiotics.jpg'
    },
    {
        name: 'Lisinopril',
        weight: 75,
        image: '/medications/lisinopril.jpg'
    },
    {
        name: 'Metformin',
        weight: 75,
        image: '/medications/metformin.jpg'
    }
];

const main = async (): Promise<void> => {
    await prisma.medication.deleteMany();

    const medications =  await Promise.all(
        MEDICATIONS.map(async (med, index) => {
            const code = generateMedicationCode({
                name: med.name,
                weight: med.weight,
            });

            return prisma.medication.create({
                data: {
                    name: med.name,
                    weight: med.weight,
                    code,
                    image: med.image
                }
            });
        })
    );

    console.log(`Seeded:
        - ${medications.length} medications.
    `);

};

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});