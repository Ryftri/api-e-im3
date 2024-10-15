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
  UseInterceptors,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PengumpulanService } from 'src/pengumpulan/pengumpulan.service';
import { CreatePengumpulanDto } from 'src/pengumpulan/dto/create-pengumpulan.dto';
import { UpdatePengumpulanDto } from 'src/pengumpulan/dto/update-pengumpulan.dto';
import { ApiOperation, ApiConsumes, ApiTags, ApiHeader } from '@nestjs/swagger';
import { BigIntToJSON } from 'src/common/utils/bigint-to-json';
import { Request, Response } from 'express';

import { Roles } from 'src/common/anotations/roles';
import { JwtAuthGuard } from 'src/common/guards/access-token.guard';
import { RoleGuard } from 'src/common/guards/roles.guard';

import { AuthGuard } from 'src/common/guards/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileCountInterceptor } from 'src/common/utils/FileCountInterceptor';
import { PelajaranService } from 'src/pelajaran/pelajaran.service';
import { TugasService } from 'src/tugas/tugas.service';
import { PrismaService } from 'src/prisma/prisma.service';
import FileData from 'src/common/types/FileData';
import { ConfigService } from '@nestjs/config';
import { validateAndUploadFiles } from 'src/common/utils/validate-upload-file';
import { validateAndUpdateFiles } from 'src/common/utils/validate-update-file';
import { deleteManyFiles } from 'src/common/utils/deleteFiles';

@UseGuards(AuthGuard)
@ApiTags('Pengumpulan')
@Controller('pengumpulan')
export class PengumpulanController {
  constructor(
    private readonly pengumpulanService: PengumpulanService,
    private readonly tugasService: TugasService,
    private readonly prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  @Post('create')
  @Roles('admin', 'guru', 'siswa')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer [token]',
    required: true,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Create Pengumpulan' })
  @UseInterceptors(FilesInterceptor('files', 11), FileCountInterceptor)
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() createPengumpulanDto: CreatePengumpulanDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;
    const files = req['files'] as Express.Multer.File[];

    const tugas = await this.tugasService.findOne(createPengumpulanDto.tugasId);

    if (!tugas) {
      throw new NotFoundException('Tugas tidak ditemukan');
    }
  
    const currentTime = new Date();

    if (currentTime < tugas.openIn) {
      throw new ForbiddenException('Tugas belum dibuka. Anda tidak dapat mengumpulkan tugas sekarang.');
    }

    if (currentTime > tugas.deadline) {
      throw new ForbiddenException('Waktu pengumpulan sudah berakhir.');
    }

    const fileNameAndUrl = await validateAndUploadFiles(
      'pengumpulan',
      files,
      this.configService,
    );

    const pengumpulan = await this.pengumpulanService.create(
      userId,
      createPengumpulanDto,
      fileNameAndUrl
    );

    return res.status(201).json({
      status: 'success',
      message: 'Berhasil menambah pengumpulan',
      pengumpulan: JSON.parse(JSON.stringify(pengumpulan, BigIntToJSON)),
    });
  }

  @Get('get-all')
  @Roles('admin', 'guru', 'siswa')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get All Pengumpulan' })
  async findAll(@Res() res: Response, @Req() req: Request) {
    const userId = req['user'].sub;
    const role = req['role'];
    const pengumpulan = await this.pengumpulanService.findMany(userId, role);

    return res.status(200).json({
      status: 'success',
      message: 'Berhasil mengambil semua pengumpulan',
      pengumpulan: JSON.parse(JSON.stringify(pengumpulan, BigIntToJSON)),
    });
  }

  @Get('get-by-id/:id')
  @Roles('admin', 'guru', 'siswa')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get One Pengumpulan' })
  async findOne(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;
    const role = req['role'];

    const pengumpulan = await this.prismaService.pengumpulan.findUnique({
      where: { id },
      include: {
        pengumpul: {
            omit: {
                password: true,
                username: true,
                email: true,
                isActive: true,
                asal_sekolah: true
            }
        },
        tugas: true
      }
    });;
  
    if (!pengumpulan) {
      throw new NotFoundException('Pengumpulan tidak ditemukan');
    }
  
    if (role === 'guru') {
      if (Number(pengumpulan.tugas.creatorId) !== userId) {
        throw new ForbiddenException('Anda tidak memiliki akses untuk melihat pengumpulan ini.');
      }
    } else if (role === 'siswa') {
      if (Number(pengumpulan.pengumpulId) !== userId) {
        throw new ForbiddenException('Anda tidak memiliki akses untuk melihat pengumpulan ini.');
      }
    }
  
    return res.status(200).json({
      status: 'success',
      message: 'Berhasil menemukan pengumpulan',
      pengumpulan: JSON.parse(JSON.stringify(pengumpulan, BigIntToJSON)),
    });
  }

  @Patch('update/:id')
  @Roles('siswa')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(FilesInterceptor('files', 11), FileCountInterceptor)
  @ApiOperation({ summary: 'Update Pengumpulan' })
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: number,
    @Body() updatePengumpulanDto: UpdatePengumpulanDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;
    const role = req['role'];
    const files = req['files'] as Express.Multer.File[];

    const pengumpulan = await this.prismaService.pengumpulan.findUnique({
      where: {
        id: id,
        pengumpulId: userId
      }
    });

    if (!pengumpulan)
      throw new NotFoundException('Pengumpulan tidak ditemukan');

    const oldFiles: FileData[] = (pengumpulan.files as unknown as any[]).map(
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
          'pengumpulan',
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

    const pengumpulanUpdate = await this.pengumpulanService.update({
      where: { id },
      data: updatePengumpulanDto,
      files: newFiles
    });

    return res.status(200).json({
      status: 'success',
      message: 'Berhasil memperbarui pengumpulan',
      pengumpulan: JSON.parse(JSON.stringify(pengumpulanUpdate, BigIntToJSON)),
    });
  }

  @Delete('delete/:id')
  @Roles('admin', 'guru', 'siswa')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Delete Pengumpulan' })
  async remove(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;
    const role = req['role'];

    const pengumpulan = await this.prismaService.pengumpulan.findUnique({
      where: { id },
      include: {
        tugas: true, 
      },
    });

    if (!pengumpulan) {
      throw new NotFoundException('Pengumpulan tidak ditemukan');
    }
    
    if (role === 'guru') {
      
      if (Number(pengumpulan.tugas.creatorId) !== userId) {
        throw new ForbiddenException('Anda tidak memiliki akses untuk menghapus pengumpulan ini.');
      }
    } else if (role === 'siswa') {
      if (Number(pengumpulan.pengumpulId) !== userId) {
        throw new ForbiddenException('Anda tidak memiliki akses untuk menghapus pengumpulan ini.');
      }
    }

    const oldFiles: FileData[] = (pengumpulan.files as unknown as any[]).map(
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
        await deleteManyFiles(oldFiles, 'pengumpulan');
      } catch (error) {
        throw new BadRequestException(`Gagal menghapus file: ${error.message}`);
      }
    }

    await this.pengumpulanService.delete({ id });

    return res.status(200).json({
      status: 'success',
      message: 'Berhasil menghapus pengumpulan',
    });
  }
}
