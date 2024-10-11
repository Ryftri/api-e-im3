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
  Req,
  UseGuards,
  ForbiddenException,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { TugasService } from 'src/tugas/tugas.service';
import { CreateTugasDto } from 'src/tugas/dto/create-tugas.dto';
import { UpdateTugasDto } from 'src/tugas/dto/update-tugas.dto';
import {
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BigIntToJSON } from 'src/common/utils/bigint-to-json';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/anotations/roles';
import { JwtAuthGuard } from 'src/common/guards/access-token.guard';
import { RoleGuard } from 'src/common/guards/roles.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { validateAndUploadFiles } from 'src/common/utils/validate-upload-file';
import { ConfigService } from '@nestjs/config';
import { validateAndUpdateFiles } from 'src/common/utils/validate-update-file';
import FileData from 'src/common/types/FileData';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileCountInterceptor } from 'src/common/utils/FileCountInterceptor';
import { deleteManyFiles } from 'src/common/utils/deleteFiles';

@UseGuards(AuthGuard)
@Controller('tugas')
@ApiTags('Tugas')
export class TugasController {
  constructor(
    private readonly tugasService: TugasService,
    private readonly prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  @Post('create')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer [token]',
    required: true,
  })
  @Roles('admin', 'guru')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(FilesInterceptor('files', 11), FileCountInterceptor)
  @ApiOperation({ summary: 'Create Tugas' })
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() createTugasDto: CreateTugasDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;
    const role = req['role'];
    const files = req['files'] as Express.Multer.File[];

    if (role === 'guru') {
      const pelajaran = await this.prisma.pelajaran.findFirst({
        where: {
          id: createTugasDto.pelajaranId,
          creatorId: userId,
        },
      });

      if (!pelajaran) {
        throw new ForbiddenException(
          'Anda hanya bisa membuat tugas pada materi yang Anda buat sendiri.',
        );
      }
    }

    const fileNameAndUrl = await validateAndUploadFiles(
      'tugas',
      files,
      this.configService,
    );

    const tugas = await this.tugasService.create(userId, createTugasDto, fileNameAndUrl);

    return res.status(201).json({
      status: 'success',
      message: 'Berhasil menambah tugas',
      tugas: JSON.parse(JSON.stringify(tugas, BigIntToJSON)),
    });
  }

  @Get('get-all')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer [token]',
    required: true,
  })
  @Roles('admin', 'guru')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get All Tugas' })
  async findAll(@Res() res: Response, @Req() req: Request) {
    const userId = req['user'].sub;
    const role = req['role'];

    const selecttedItem: Prisma.TugasInclude = {
      creator: {
        omit: {
          password: true,
          username: true,
          email: true,
          isActive: true,
        }
      }
    };

    const tugas =
      role === 'admin'
        ? await this.tugasService.findManyFilteredWithInclude({
            include: selecttedItem,
          })
        : await this.tugasService.findManyFilteredWithInclude({
            where: {
              creatorId: userId,
            },
            include: selecttedItem,
          });

    return res.status(200).json({
      status: 'success',
      message: 'Berhasil mengambil semua tugas',
      tugas: JSON.parse(JSON.stringify(tugas, BigIntToJSON)),
    });
  }

  @Get('get-by-id/:id')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer [token]',
    required: true,
  })
  @Roles('admin', 'guru', 'siswa')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get One Tugas' })
  async findOne(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;
    const role = req['role'];

    const selectedItems: Prisma.TugasInclude = {
      pelajaran: {
        include: {
          creator: {
            omit: {
              password: true,
              username: true,
              email: true,
              isActive: true,
            }
          }
        }
      },
      pengumpulan: true
    };

    const tugas =
      role === 'admin'
        ? await this.tugasService.findOneFilteredWithInclude({
            where: { id },
            include: selectedItems,
          })
        : role === 'guru'
          ? await this.tugasService.findOneFilteredWithInclude({
              where: {
                id,
                creatorId: userId,
              },
              include: selectedItems,
            })
          : await this.tugasService.findOneFilteredWithInclude({
              where: {
                id,
              },
              include: selectedItems,
            });

    if (!tugas) throw new NotFoundException('Tugas tidak ditemukan');

    return res.status(200).json({
      status: 'success',
      message: 'Berhasil menemukan tugas',
      tugas: JSON.parse(JSON.stringify(tugas, BigIntToJSON)),
    });
  }

  @Patch('update/:id')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer [token]',
    required: true,
  })
  @Roles('admin', 'guru')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(FilesInterceptor('files', 11), FileCountInterceptor)
  @ApiOperation({ summary: 'Update Tugas' })
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: number,
    @Body() updateTugasDto: UpdateTugasDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;
    const role = req['role'];
    const files = req['files'] as Express.Multer.File[];

    const tugas =
      role === 'admin'
        ? await this.tugasService.findOne(id)
        : await this.tugasService.findOneFilteredWithInclude({
            where: {
              id,
              creatorId: userId,
            },
            include: {
              pelajaran: true,
            },
          });

    if (!tugas) throw new NotFoundException('Tugas tidak ditemukan');

    const oldFiles: FileData[] = (tugas.files as unknown as any[]).map(
      (file) => {
        if (
          typeof file === 'object' &&
          'fileUrl' in file &&
          'fileName' in file &&
          'originalName' in file
        ) {
          return file as FileData;
        } else {
          throw new BadRequestException('Invalid file data structure');
        }
      },
    );

    let uploadedFiles = [];
    if (files && files.length > 0) {
      try {
        uploadedFiles = await validateAndUpdateFiles(
          oldFiles,
          'tugas',
          files,
          this.configService,
        );
      } catch (error) {
        throw new BadRequestException(
          `Gagal mengunggah file: ${error.message}`,
        );
      }
    }

    let newFiles = [];
    if (uploadedFiles.length > 0) {
      newFiles = uploadedFiles.map((file) => ({
        fileUrl: file.fileUrl,
        fileName: file.fileName,
        originalName: file.originalName,
      }));
    }

    const tugasUpdate = await this.tugasService.update({
      where: { id },
      data: updateTugasDto,
      files: newFiles
    });

    return res.status(200).json({
      status: 'success',
      message: 'Berhasil memperbarui tugas',
      tugas: JSON.parse(JSON.stringify(tugasUpdate, BigIntToJSON)),
    });
  }

  @Delete('delete/:id')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer [token]',
    required: true,
  })
  @Roles('admin', 'guru')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Delete Tugas' })
  async remove(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;
    const role = req['role'];

    const tugas =
      role === 'admin'
        ? await this.tugasService.findOne(id)
        : await this.tugasService.findOneFilteredWithInclude({
            where: {
              id,
              creatorId: userId,
            },
            include: {
              pelajaran: true,
            },
          });

    if (!tugas) throw new NotFoundException('Tugas tidak ditemukan');

    const oldFiles: FileData[] = (tugas.files as unknown as any[]).map(
      (file) => {
        if (
          typeof file === 'object' &&
          'fileUrl' in file &&
          'fileName' in file &&
          'originalName' in file
        ) {
          return file as FileData;
        } else {
          throw new BadRequestException('Invalid file data structure');
        }
      },
    );

    if (oldFiles && oldFiles.length > 0) {
      try {
        await deleteManyFiles(oldFiles, 'tugas');
      } catch (error) {
        throw new BadRequestException(`Gagal menghapus file: ${error.message}`);
      }
    }

    await this.tugasService.delete({ id });

    return res.status(200).json({
      status: 'success',
      message: 'Berhasil menghapus tugas',
    });
  }
}
