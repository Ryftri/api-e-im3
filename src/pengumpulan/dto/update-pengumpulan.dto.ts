import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePengumpulanDto {
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
