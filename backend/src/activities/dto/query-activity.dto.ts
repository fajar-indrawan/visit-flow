import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { Segment, VisitStatus } from '@prisma/client';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export class QueryActivityDto {
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsEnum(Segment, { message: 'Segment harus B2G atau B2B' })
  segment?: Segment;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsEnum(VisitStatus, { message: 'Status harus NOT_VISITED atau VISITED' })
  status?: VisitStatus;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal mulai (from) harus YYYY-MM-DD' })
  from?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal akhir (to) harus YYYY-MM-DD' })
  to?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  search?: string;
}
