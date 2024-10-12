import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreatePengumpulanDto } from 'src/pengumpulan/dto/create-pengumpulan.dto';
import { UpdatePengumpulanDto } from 'src/pengumpulan/dto/update-pengumpulan.dto';
import { Pengumpulan, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PengumpulanService {
  constructor(private prisma: PrismaService) {}

  async create(
    pengumpulId: number,
    data: CreatePengumpulanDto,
    files: any[],
  ): Promise<Partial<Pengumpulan>> {
    return this.prisma.pengumpulan.create({
      data: {
        pengumpulId,
        ...data,
        files
      },
    });
  }

  async update({
    where,
    data,
    files
  }: {
    where: Prisma.PengumpulanWhereUniqueInput;
    data: UpdatePengumpulanDto;
    files: any[]
  }): Promise<Partial<Pengumpulan>> {
    return this.prisma.pengumpulan.update({
      where,
      data: {
        ...data,
        files
      },
    });
  }

  async delete(
    where: Prisma.PengumpulanWhereUniqueInput,
  ): Promise<Partial<Pengumpulan>> {
    return this.prisma.pengumpulan.delete({
      where,
    });
  }

  async findOne(id: number): Promise<Partial<Pengumpulan> | null> {
    return this.prisma.pengumpulan.findUnique({
      where: { id },
      include: {
        tugas: true
      }
    });
  }

  async findMany(
    userId: bigint,
    role: string,
  ): Promise<Partial<Pengumpulan>[]> {
    const includeData: Prisma.PengumpulanInclude = {
      pengumpul: {
        omit: {
          password: true,
          username: true,
          createdAt: true,
          updatedAt: true,
          email: true
        },
      },
    }

    if (role === 'admin') {
      return this.prisma.pengumpulan.findMany({
        include: includeData,
      });
    }

    if (role === 'guru') {
      return this.prisma.pengumpulan.findMany({
        where: {
          tugas: {
            creatorId: userId,
          },
        },
        include: includeData,
      });
    }

    if (role === 'siswa') {
      return this.prisma.pengumpulan.findMany({
        where: {
          pengumpulId: userId,
        },
        include: includeData,
      });
    }

    throw new ForbiddenException('Peran tidak dikenali.');
  }

  async findOneFilteredWithSelect({
    where,
    select,
  }: {
    where: Prisma.PengumpulanWhereUniqueInput;
    select: Prisma.PengumpulanSelect;
  }): Promise<Partial<Pengumpulan> | null> {
    return this.prisma.pengumpulan.findUnique({
      where,
      select,
    });
  }

  async findManyFilteredWithSelect({
    where,
    select,
  }: {
    where?: Prisma.PengumpulanWhereInput;
    select: Prisma.PengumpulanSelect;
  }): Promise<Partial<Pengumpulan>[]> {
    return this.prisma.pengumpulan.findMany({
      where,
      select,
    });
  }

  async findOneFilteredWithInclude({
    where,
    include,
  }: {
    where: Prisma.PengumpulanWhereUniqueInput;
    include: Prisma.PengumpulanInclude;
  }): Promise<Partial<Pengumpulan> | null> {
    return this.prisma.pengumpulan.findUnique({
      where,
      include,
    });
  }

  async findManyFilteredWithInclude({
    where,
    include,
  }: {
    where?: Prisma.PengumpulanWhereInput;
    include: Prisma.PengumpulanInclude;
  }): Promise<Partial<Pengumpulan>[]> {
    return this.prisma.pengumpulan.findMany({
      where,
      include,
    });
  }
}
