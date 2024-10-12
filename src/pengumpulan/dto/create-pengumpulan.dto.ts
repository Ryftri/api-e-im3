import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreatePengumpulanDto {
  @ApiProperty({
    description: 'ID tugas yang terkait dengan pengumpulan',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  tugasId: number;

  @ApiProperty({
    description: 'Isi detail pengumpulan',
    example: "Detail Pengumpulan",
  })
  @IsOptional()
  @IsString()
  detail_pengumpulan?: string;
}
