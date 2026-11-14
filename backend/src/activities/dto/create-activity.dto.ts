import { IsDateString, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Segment } from '@prisma/client';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty({ message: 'Entitas wajib dipilih' })
  entityId: string;

  @IsEnum(Segment, { message: 'Segmen wajib dipilih (B2G atau B2B)' })
  segment: Segment;

  @IsDateString({}, { message: 'Tanggal kunjungan wajib diisi (format YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Tanggal kunjungan wajib diisi' })
  visitDate: string;

  @IsString()
  @IsNotEmpty({ message: 'Nama sales wajib diisi' })
  @MaxLength(100, { message: 'Nama sales maksimal 100 karakter' })
  salesName: string;
}
