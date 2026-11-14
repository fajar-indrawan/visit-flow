import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { QueryActivityDto } from './dto/query-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  findAll(@Query() query: QueryActivityDto) {
    return this.activitiesService.findAll(query);
  }

  @Post()
  create(
    @Body() dto: CreateActivityDto,
    @Request() req: { user: { userId: number } },
  ) {
    return this.activitiesService.create(dto, req.user.userId);
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateActivityDto) {
    return this.activitiesService.updateStatus(id, dto);
  }
}
