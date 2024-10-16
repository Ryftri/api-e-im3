import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Res,
  UseGuards,
  Req,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { NilaiService } from 'src/nilai/nilai.service';
import { CreateNilaiDto } from 'src/nilai/dto/create-nilai.dto';
import { UpdateNilaiDto } from 'src/nilai/dto/update-nilai.dto';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BigIntToJSON } from 'src/common/utils/bigint-to-json';
import { Request, Response } from 'express';
import { Roles } from 'src/common/anotations/roles';
import { JwtAuthGuard } from 'src/common/guards/access-token.guard';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/roles.guard';
import { PengumpulanService } from 'src/pengumpulan/pengumpulan.service';
import { PrismaService } from 'src/prisma/prisma.service';

@UseGuards(AuthGuard)
@ApiTags('Nilai')
@Controller('nilai')
export class NilaiController {
  constructor(
    private readonly nilaiService: NilaiService,
    private readonly pengumpulanService: PengumpulanService,
    private readonly prisma: PrismaService,
  ) { }

  @Post('create')
  @Roles('admin', 'guru')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer [token]',
    required: true,
  })
  @ApiOperation({ summary: 'Create Nilai' })
  async create(
    @Body() createNilaiDto: CreateNilaiDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;
    const role = req['role'];

    const pengumpulan = await this.prisma.pengumpulan.findUnique({
      where: {
        id: createNilaiDto.pengumpulanId,
      },
      include: {
        tugas: true,
        nilai: true
      },
    });

    if (!pengumpulan) {
      throw new NotFoundException('Pengumpulan tidak ditemukan');
    }

    if (role !== 'admin') {
      if (Number(pengumpulan.tugas.creatorId) !== userId)
        throw new ForbiddenException('Akses terlarang');
    }

    if (pengumpulan.nilai) {
      throw new ConflictException('Nilai sudah diinputkan sebelumnya');
    }

    if (createNilaiDto.nilai < 0 || createNilaiDto.nilai > 100) {
      throw new BadRequestException('Nilai harus antara 0 dan 100');
    }

    const nilai = await this.nilaiService.create(createNilaiDto);

    return res.status(201).json({
      status: 'success',
      message: 'Berhasil menambah nilai',
      nilai: JSON.parse(JSON.stringify(nilai, BigIntToJSON)),
    });
  }

  @Get('get-all')
  @Roles('admin', 'guru')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer [token]',
    required: true,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get All Nilai' })
  async findAll(@Res() res: Response, @Req() req: Request) {
    const userId = req['user'].sub;
    const role = req['role'];

    const nilai =
      role === 'admin'
        ? await this.nilaiService.findManyFilteredWithSelect({
          select: {
            id: true,
            pengumpulanId: true,
            nilai: true,
            createdAt: true,
            updatedAt: true,
            pengumpulan: {
              select: {
                tugasId: true,
                pengumpul: {
                  select: {
                    nama_lengkap: true,
                  },
                },
                tugas: {
                  select: {
                    nama_tugas: true,
                  },
                },
              },
            },
          },
        })
        : await this.pengumpulanService.findManyFilteredWithSelect({
          where: {
            tugas: {
              creatorId: userId,
            },
          },
          select: {
            id: true,
            nilai: true,
            createdAt: true,
            updatedAt: true,
            pengumpul: {
              select: {
                nama_lengkap: true,
              },
            },
            tugas: {
              select: {
                nama_tugas: true,
              },
            },
          },
        });

    return res.status(200).json({
      status: 'success',
      message: 'Berhasil mengambil semua nilai',
      nilai: JSON.parse(JSON.stringify(nilai, BigIntToJSON)),
    });
  }

  @Get('get-by-id/:id')
  @Roles('admin', 'guru')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer [token]',
    required: true,
  })
  @ApiOperation({ summary: 'Get One Nilai' })
  async findOne(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;
    const role = req['role'];
    const nilai = await this.prisma.nilai.findUnique({
      where: { id },
      select: {
        id: true,
        pengumpulanId: true,
        nilai: true,
        createdAt: true,
        updatedAt: true,
        pengumpulan: {
          select: {
            tugasId: true,
            tugas: {
              select: {
                creatorId: true,
              },
            },
            pengumpul: {
              select: {
                id: true,
                nama_lengkap: true,
              },
            },
          },
        },
      },
    });

    if (!nilai) {
      throw new ForbiddenException('Nilai tidak ditemukan.');
    }

    if (
      role !== 'admin' &&
      Number(nilai.pengumpulan.tugas.creatorId) !== userId
    ) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses untuk melihat nilai ini.',
      );
    }

    return res.status(200).json({
      status: 'success',
      message: 'Berhasil menemukan nilai',
      nilai: JSON.parse(JSON.stringify(nilai, BigIntToJSON)),
    });
  }

  @Patch('update/:id')
  @Roles('admin', 'guru')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Update Nilai' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer [token]',
    required: true,
  })
  async update(
    @Param('id') id: number,
    @Body() updateNilaiDto: UpdateNilaiDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;
    const role = req['role'];
    const nilai = await this.prisma.nilai.findUnique({
      where: { id: id },
      include: {
        pengumpulan: {
          include: {
            tugas: true,
          },
        },
      },
    });

    if (!nilai) {
      throw new ForbiddenException('Nilai tidak ditemukan.');
    }

    if (
      role !== 'admin' &&
      Number(nilai.pengumpulan.tugas.creatorId) !== userId
    ) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses untuk memperbarui nilai ini.',
      );
    }

    const nilaiUpdate = await this.nilaiService.update({
      where: { id },
      data: updateNilaiDto,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Berhasil memperbarui nilai',
      nilai: JSON.parse(JSON.stringify(nilaiUpdate, BigIntToJSON)),
    });
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete Nilai' })
  @Roles('admin', 'guru')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer [token]',
    required: true,
  })
  async remove(
    @Param('id') id: number, 
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;
    const role = req['role'];

    const nilai = await this.prisma.nilai.findUnique({
      where: { id },
      include: {
        pengumpulan: {
          include: {
            tugas: true
          }
        }
      }
    });

    if (!nilai) throw new NotFoundException('Nilai tidak ditemukan');

    if (role === 'guru') {
      const tugas = await this.prisma.tugas.findUnique({
        where: {
          id: nilai.pengumpulan.tugasId,
          creatorId: Number(userId)
        }
      })

      if(!tugas) throw new UnauthorizedException('Maaf anda tidak memiliki akses tugas ini.')
    }

    await this.nilaiService.delete({ id });

    return res.status(200).json({
      status: 'success',
      message: 'Berhasil menghapus nilai',
    });
  }
}
