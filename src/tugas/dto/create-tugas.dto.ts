import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDate,
  IsOptional,
} from 'class-validator';

export class CreateTugasDto {
  @ApiProperty({
    description: 'ID pelajaran yang terkait dengan tugas',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  pelajaranId: number;

  @ApiProperty({
    description: 'ID dari user yang membuat tugas',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  creatorId: number;


  @ApiProperty({ description: 'Nama tugas', example: 'Tugas Matematika' })
  @IsNotEmpty()
  @IsString()
  nama_tugas: string;

  @ApiProperty({
    description: 'Isi tugas',
  })
  @IsOptional()
  @IsString()
  isi_tugas?: string;

  @ApiProperty({
    description: 'Tanggal tugas dibuka',
    example: '2024-12-31T23:59:59Z',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  openIn: Date;
  
  @ApiProperty({
    description: 'Tanggal batas waktu tugas',
    example: '2024-12-31T23:59:59Z',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  deadline: Date;
}
