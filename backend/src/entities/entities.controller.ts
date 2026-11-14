import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Segment } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EntitiesService } from './entities.service';

@UseGuards(JwtAuthGuard)
@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Get()
  findAll(@Query('segment') segment?: string, @Query('search') search?: string) {
    let parsedSegment: Segment | undefined;
    if (segment && segment.trim() !== '') {
      if (segment !== Segment.B2G && segment !== Segment.B2B) {
        throw new BadRequestException('Segment harus bernilai B2G atau B2B');
      }
      parsedSegment = segment as Segment;
    }

    return this.entitiesService.findOptions(parsedSegment, search);
  }
}
