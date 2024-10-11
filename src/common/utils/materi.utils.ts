import { MateriService } from "src/materi/materi.service";

export default async function findMateriByRole(
    id: number, 
    userId: number, 
    role: string,
    materiService: MateriService
) {
    const includeOptions = {
        pelajaran: true,
        tugas: true,
        userAccess: {
            include: {
                user: {
                    omit: {
                        password: true
                    }
                }
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
        include: {
            pelajaran: true,
        },
    });
}
  