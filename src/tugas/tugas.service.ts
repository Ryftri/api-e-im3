import { Injectable } from '@nestjs/common';
import { CreateTugasDto } from 'src/tugas/dto/create-tugas.dto';
import { UpdateTugasDto } from 'src/tugas/dto/update-tugas.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Tugas } from '@prisma/client';

@Injectable()
export class TugasService {
  constructor(private prisma: PrismaService) {}

  async create(
    creatorId: number,
    data: CreateTugasDto,
    files: any[],
  ): Promise<Partial<Tugas>> {
    return this.prisma.tugas.create({
      data: {
        ...data,
        files,
        creatorId,
      },
    });
  }

  async update({
    where,
    data,
    files,
    creatorId
  }: {
    where: Prisma.TugasWhereUniqueInput;
    data: UpdateTugasDto;
    files: any[];
    creatorId: number
  }): Promise<Partial<Tugas>> {
    return this.prisma.tugas.update({
      where,
      data: {
        ...data,
        files,
        creatorId
      },
    });
  }

  async delete(where: Prisma.TugasWhereUniqueInput): Promise<Partial<Tugas>> {
    return this.prisma.tugas.delete({
      where,
    });
  }

  async findOne(id: number): Promise<Partial<Tugas> | null> {
    return this.prisma.tugas.findUnique({
      where: { id },
    });
  }

  async findMany(): Promise<Partial<Tugas>[]> {
    return this.prisma.tugas.findMany();
  }

  async findOneFilteredWithSelect({
    where,
    select,
  }: {
    where: Prisma.TugasWhereInput;
    select: Prisma.TugasSelect;
  }): Promise<Partial<Tugas> | null> {
    return this.prisma.tugas.findFirst({
      where,
      select,
    });
  }

  async findManyFilteredWithSelect({
    where,
    select,
  }: {
    where?: Prisma.TugasWhereInput;
    select: Prisma.TugasSelect;
  }): Promise<Partial<Tugas>[]> {
    return this.prisma.tugas.findMany({
      where,
      select,
    });
  }

  async findOneFilteredWithInclude({
    where,
    include,
  }: {
    where: Prisma.TugasWhereInput;
    include: Prisma.TugasInclude;
  }): Promise<Partial<Tugas> | null> {
    return this.prisma.tugas.findFirst({
      where,
      include,
    });
  }

  async findManyFilteredWithInclude({
    where,
    include,
  }: {
    where?: Prisma.TugasWhereInput;
    include: Prisma.TugasInclude;
  }): Promise<Partial<Tugas>[]> {
    return this.prisma.tugas.findMany({
      where,
      include,
    });
  }
}
