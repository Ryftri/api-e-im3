import { Prisma } from "@prisma/client";
import { MateriService } from "src/materi/materi.service";

export default async function findMateriByRole(
    id: number, 
    userId: number, 
    role: string,
    materiService: MateriService
) {
    const includeOptions: Prisma.MateriInclude = {
        pelajaran: true,
        creator: {
            omit: {
                password: true,
                username: true,
                email: true,
                isActive: true,
            }
        }
    };

    if (role === 'admin') {
        return await materiService.findOneFilteredWithInclude({
            where: { id },
            include: includeOptions,
        });
    }

    if (role === 'guru') {
        return await materiService.findOneFilteredWithInclude({
            where: {
                id,
                creatorId: userId,
            },
            include: includeOptions,
        });
    }

    return await materiService.findOneFilteredWithInclude({
        where: {
            id,
        },
        include: includeOptions
    });
}
  