import { prisma } from "./PrismaModule";

export async function tugasSeed() {
    const tugas1KelasA = await prisma.tugas.upsert({
        where: { id: 1 },
        update: {},
        create: {
            pelajaranId: 1,
            openIn: new Date(),
            nama_tugas: "Tugas 1 - Materi A Pelajaran A Kelas 1A",
            deadline: new Date("2024-08-30T23:59:59.999Z"),
            creatorId: 2,
        }
    });

    const tugas2KelasA = await prisma.tugas.upsert({
        where: { id: 2 },
        update: {},
        create: {
            pelajaranId: 2,
            openIn: new Date(),
            nama_tugas: "Tugas 2 - Materi B Pelajaran A Kelas 1A",
            deadline: new Date("2024-08-30T23:59:59.999Z"),
            creatorId: 2,
        }
    });

    const tugas3KelasA = await prisma.tugas.upsert({
        where: { id: 3 },
        update: {},
        create: {
            pelajaranId: 3,
            openIn: new Date(),
            nama_tugas: "Tugas 3 - Materi A Pelajaran B Kelas 1A",
            deadline: new Date("2024-08-30T23:59:59.999Z"),
            creatorId: 2,
        }
    });

    const tugas4KelasA = await prisma.tugas.upsert({
        where: { id: 4 },
        update: {},
        create: {
            pelajaranId: 4,
            openIn: new Date(),
            nama_tugas: "Tugas 4 - Materi B Pelajaran B Kelas 1A",
            deadline: new Date("2024-08-30T23:59:59.999Z"),
            creatorId: 2,
        }
    });

    const tugas1KelasB = await prisma.tugas.upsert({
        where: { id: 5 },
        update: {},
        create: {
            pelajaranId: 5,
            openIn: new Date(),
            nama_tugas: "Tugas 1 - Materi A Pelajaran A Kelas 1B",
            deadline: new Date("2024-08-30T23:59:59.999Z"),
            creatorId: 3,
        }
    });

    const tugas2KelasB = await prisma.tugas.upsert({
        where: { id: 6 },
        update: {},
        create: {
            pelajaranId: 6,
            openIn: new Date(),
            nama_tugas: "Tugas 2 - Materi B Pelajaran A Kelas 1B",
            deadline: new Date("2024-08-30T23:59:59.999Z"),
            creatorId: 3,
        }
    });

    const tugas3KelasB = await prisma.tugas.upsert({
        where: { id: 7 },
        update: {},
        create: {
            pelajaranId: 7,
            openIn: new Date(),
            nama_tugas: "Tugas 3 - Materi A Pelajaran B Kelas 1B",
            deadline: new Date("2024-08-30T23:59:59.999Z"),
            creatorId: 3,
        }
    });

    const tugas4KelasB = await prisma.tugas.upsert({
        where: { id: 8 },
        update: {},
        create: {
            pelajaranId: 8,
            openIn: new Date(),
            nama_tugas: "Tugas 4 - Materi B Pelajaran B Kelas 1B",
            deadline: new Date("2024-08-30T23:59:59.999Z"),
            creatorId: 3,
        }
    });

    console.log('Seeding completed for Tugas!')
}
