import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { VisitStatus } from '@prisma/client';

export class UpdateActivityDto {
  @IsEnum(VisitStatus, { message: 'Status harus bernilai VISITED atau NOT_VISITED' })
  status: VisitStatus;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Nama sales minimal 2 karakter' })
  @MaxLength(100, { message: 'Nama sales maksimal 100 karakter' })
  salesName?: string;
}
