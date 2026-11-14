import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Activity, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { QueryActivityDto } from './dto/query-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryActivityDto) {
    if (query.from && query.to && query.from > query.to) {
      throw new BadRequestException('Tanggal mulai tidak boleh melebihi tanggal akhir');
    }

    const where: Prisma.ActivityWhereInput = {};

    if (query.segment) {
      where.segment = query.segment;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.from || query.to) {
      where.visitDate = {};
      if (query.from) {
        where.visitDate.gte = new Date(`${query.from}T00:00:00.000Z`);
      }
      if (query.to) {
        where.visitDate.lte = new Date(`${query.to}T23:59:59.999Z`);
      }
    }

    if (query.search && query.search.trim() !== '') {
      where.entityName = {
        contains: query.search.trim(),
      };
    }

    const records = await this.prisma.activity.findMany({
      where,
      orderBy: [{ visitDate: 'asc' }, { createdAt: 'desc' }],
    });

    const data = records.map((item) => this.formatActivity(item));
    const visited = data.filter((item) => item.status === 'VISITED').length;
    const notVisited = data.filter((item) => item.status === 'NOT_VISITED').length;

    return {
      data,
      summary: {
        total: data.length,
        visited,
        notVisited,
      },
    };
  }

  async create(dto: CreateActivityDto, userId: number) {
    let entityId: string | null = null;
    let entityName: string;
    let entityType: string;
    let entityRegion: string;

    if (dto.entityId.startsWith('hist:')) {
      const sourceActivityId = dto.entityId.replace('hist:', '');
      const historical = await this.prisma.activity.findUnique({
        where: { id: sourceActivityId },
      });
      if (!historical) {
        throw new NotFoundException('Entitas riwayat tidak ditemukan');
      }
      entityName = historical.entityName;
      entityType = historical.entityType;
      entityRegion = historical.entityRegion;
    } else {
      const masterEntity = await this.prisma.entity.findUnique({
        where: { id: dto.entityId },
      });
      if (!masterEntity) {
        throw new NotFoundException('Entitas tidak ditemukan di master data');
      }
      entityId = masterEntity.id;
      entityName = masterEntity.name;
      entityType = masterEntity.type;
      entityRegion = masterEntity.region;
    }

    const created = await this.prisma.activity.create({
      data: {
        entityId,
        entityName,
        entityType,
        entityRegion,
        segment: dto.segment,
        visitDate: new Date(`${dto.visitDate}T00:00:00.000Z`),
        status: 'NOT_VISITED',
        salesName: dto.salesName.trim(),
        createdById: userId,
      },
    });

    return this.formatActivity(created);
  }

  async updateStatus(id: string, dto: UpdateActivityDto) {
    const existing = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Rencana kunjungan tidak ditemukan');
    }

    const updated = await this.prisma.activity.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.salesName ? { salesName: dto.salesName.trim() } : {}),
      },
    });

    return this.formatActivity(updated);
  }

  private formatActivity(activity: Activity) {
    return {
      id: activity.id,
      entityId: activity.entityId,
      entityName: activity.entityName,
      entityType: activity.entityType,
      region: activity.entityRegion,
      segment: activity.segment,
      visitDate: activity.visitDate.toISOString().split('T')[0],
      status: activity.status,
      salesName: activity.salesName,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
    };
  }
}
